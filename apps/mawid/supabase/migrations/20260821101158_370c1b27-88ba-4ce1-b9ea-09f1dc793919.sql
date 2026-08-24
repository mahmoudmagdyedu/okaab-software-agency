CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_resource_no_overlap
  EXCLUDE USING gist (
    resource_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status <> 'cancelled');

ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_staff_no_overlap
  EXCLUDE USING gist (
    staff_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (status <> 'cancelled');

CREATE OR REPLACE FUNCTION public.check_slot_conflict(
  _staff_id uuid,
  _starts_at timestamptz,
  _ends_at timestamptz,
  _exclude_appointment_id uuid DEFAULT NULL
)
RETURNS TABLE (conflicts boolean, staff_name text, conflict_start timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH s AS (
    SELECT st.id, st.tenant_id, st.full_name
    FROM public.staff st
    WHERE st.id = _staff_id AND public.is_tenant_member(st.tenant_id)
  ), c AS (
    SELECT a.starts_at
    FROM public.appointments a
    JOIN s ON s.id = a.staff_id
    WHERE a.status <> 'cancelled'
      AND (_exclude_appointment_id IS NULL OR a.id <> _exclude_appointment_id)
      AND tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(_starts_at, _ends_at, '[)')
    ORDER BY a.starts_at
    LIMIT 1
  )
  SELECT EXISTS (SELECT 1 FROM c), (SELECT full_name FROM s), (SELECT starts_at FROM c);
$$;

CREATE OR REPLACE FUNCTION public.book_appointment(
  _tenant_id uuid,
  _staff_id uuid,
  _service_id uuid,
  _customer_id uuid,
  _starts_at timestamptz,
  _note text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_service public.services%ROWTYPE;
  v_resource uuid;
  v_branch uuid;
  v_ends timestamptz;
  v_id uuid;
BEGIN
  IF NOT public.is_tenant_member(_tenant_id) THEN
    RAISE EXCEPTION 'forbidden_tenant';
  END IF;

  SELECT * INTO v_service FROM public.services
  WHERE id = _service_id AND tenant_id = _tenant_id AND is_active;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'service_not_found';
  END IF;

  SELECT branch_id INTO v_branch FROM public.staff
  WHERE id = _staff_id AND tenant_id = _tenant_id AND is_active;
  IF v_branch IS NULL THEN
    RAISE EXCEPTION 'staff_not_found';
  END IF;

  v_ends := _starts_at + make_interval(mins => v_service.duration_minutes);

  SELECT r.id INTO v_resource
  FROM public.resources r
  WHERE r.tenant_id = _tenant_id AND r.branch_id = v_branch AND r.is_active
    AND NOT EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.resource_id = r.id AND a.status <> 'cancelled'
        AND tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(_starts_at, v_ends, '[)')
    )
  ORDER BY r.name
  LIMIT 1
  FOR UPDATE OF r;

  IF v_resource IS NULL THEN
    RAISE EXCEPTION 'slot_taken';
  END IF;

  BEGIN
    INSERT INTO public.appointments (
      tenant_id, branch_id, staff_id, service_id, customer_id, resource_id,
      starts_at, ends_at, status, price_cents, deposit_cents, deposit_paid_cents,
      note, booking_ref
    ) VALUES (
      _tenant_id, v_branch, _staff_id, _service_id, _customer_id, v_resource,
      _starts_at, v_ends,
      CASE WHEN v_service.deposit_cents > 0 THEN 'pending_deposit'::appointment_status
           ELSE 'confirmed'::appointment_status END,
      v_service.price_cents, v_service.deposit_cents, 0,
      COALESCE(_note, ''), upper(substr(md5(gen_random_uuid()::text), 1, 8))
    ) RETURNING id INTO v_id;
  EXCEPTION WHEN unique_violation OR exclusion_violation THEN
    RAISE EXCEPTION 'slot_taken';
  END;

  INSERT INTO public.appointment_events (tenant_id, appointment_id, event_type, payload, actor_id)
  VALUES (_tenant_id, v_id, 'created', jsonb_build_object('starts_at', _starts_at), auth.uid());

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reschedule_appointment(
  _appointment_id uuid,
  _staff_id uuid,
  _starts_at timestamptz
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_appt public.appointments%ROWTYPE;
  v_duration integer;
  v_ends timestamptz;
  v_branch uuid;
  v_resource uuid;
BEGIN
  SELECT * INTO v_appt FROM public.appointments WHERE id = _appointment_id;
  IF NOT FOUND OR NOT public.is_tenant_member(v_appt.tenant_id) THEN
    RAISE EXCEPTION 'forbidden_tenant';
  END IF;

  SELECT duration_minutes INTO v_duration FROM public.services WHERE id = v_appt.service_id;
  v_ends := _starts_at + make_interval(mins => v_duration);

  SELECT branch_id INTO v_branch FROM public.staff
  WHERE id = _staff_id AND tenant_id = v_appt.tenant_id AND is_active;
  IF v_branch IS NULL THEN
    RAISE EXCEPTION 'staff_not_found';
  END IF;

  SELECT r.id INTO v_resource
  FROM public.resources r
  WHERE r.tenant_id = v_appt.tenant_id AND r.branch_id = v_branch AND r.is_active
    AND NOT EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.resource_id = r.id AND a.id <> _appointment_id AND a.status <> 'cancelled'
        AND tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(_starts_at, v_ends, '[)')
    )
  ORDER BY r.name
  LIMIT 1
  FOR UPDATE OF r;

  IF v_resource IS NULL THEN
    RAISE EXCEPTION 'slot_taken';
  END IF;

  BEGIN
    UPDATE public.appointments
    SET staff_id = _staff_id, branch_id = v_branch, resource_id = v_resource,
        starts_at = _starts_at, ends_at = v_ends
    WHERE id = _appointment_id;
  EXCEPTION WHEN unique_violation OR exclusion_violation THEN
    RAISE EXCEPTION 'slot_taken';
  END;

  INSERT INTO public.appointment_events (tenant_id, appointment_id, event_type, payload, actor_id)
  VALUES (v_appt.tenant_id, _appointment_id, 'rescheduled',
          jsonb_build_object('from', v_appt.starts_at, 'to', _starts_at), auth.uid());

  RETURN _appointment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_appointment_status(
  _appointment_id uuid,
  _status appointment_status
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant uuid;
BEGIN
  SELECT tenant_id INTO v_tenant FROM public.appointments WHERE id = _appointment_id;
  IF v_tenant IS NULL OR NOT public.is_tenant_member(v_tenant) THEN
    RAISE EXCEPTION 'forbidden_tenant';
  END IF;

  UPDATE public.appointments SET status = _status WHERE id = _appointment_id;

  INSERT INTO public.appointment_events (tenant_id, appointment_id, event_type, payload, actor_id)
  VALUES (v_tenant, _appointment_id, 'status_changed',
          jsonb_build_object('status', _status), auth.uid());

  RETURN _appointment_id;
END;
$$;

REVOKE ALL ON FUNCTION public.check_slot_conflict(uuid, timestamptz, timestamptz, uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.book_appointment(uuid, uuid, uuid, uuid, timestamptz, text) FROM public, anon;
REVOKE ALL ON FUNCTION public.reschedule_appointment(uuid, uuid, timestamptz) FROM public, anon;
REVOKE ALL ON FUNCTION public.set_appointment_status(uuid, appointment_status) FROM public, anon;

GRANT EXECUTE ON FUNCTION public.check_slot_conflict(uuid, timestamptz, timestamptz, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.book_appointment(uuid, uuid, uuid, uuid, timestamptz, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reschedule_appointment(uuid, uuid, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_appointment_status(uuid, appointment_status) TO authenticated;