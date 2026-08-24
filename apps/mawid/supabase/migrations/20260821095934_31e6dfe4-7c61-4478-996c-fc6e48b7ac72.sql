-- ============ PLANS ============
INSERT INTO public.plans (id, code, name, price_cents, max_staff, max_appointments_month) VALUES
 ('11111111-0000-0000-0000-000000000001','basic','الخطة الأساسية',49900,3,300),
 ('11111111-0000-0000-0000-000000000002','pro','الخطة الاحترافية',99900,10,2000),
 ('11111111-0000-0000-0000-000000000003','scale','الخطة المتقدمة',199900,50,20000);

-- ============ TENANT + BRANCH ============
INSERT INTO public.tenants (id, name, slug, timezone, currency) VALUES
 ('22222222-0000-0000-0000-000000000001','عيادة سمايل لطب الأسنان','smile','Africa/Cairo','EGP');

INSERT INTO public.subscriptions (tenant_id, plan_id, status, renews_at) VALUES
 ('22222222-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000002','active', now() + interval '21 days');

INSERT INTO public.branches (id, tenant_id, name, address, phone, timezone, free_cancellation_hours, deposit_percent) VALUES
 ('33333333-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001','فرع المعادي','٩ شارع النادي، المعادي، القاهرة','+20221234567','Africa/Cairo',24,40);

-- ============ STAFF ============
INSERT INTO public.staff (id, tenant_id, branch_id, full_name, specialty) VALUES
 ('44444444-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','د. أحمد الشريف','استشاري'),
 ('44444444-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','د. سارة محمود','تجميل أسنان'),
 ('44444444-0000-0000-0000-000000000003','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','د. خالد عبد العزيز','تقويم'),
 ('44444444-0000-0000-0000-000000000004','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','د. منى حسان','أسنان أطفال');

INSERT INTO public.resources (id, tenant_id, branch_id, name, kind) VALUES
 ('55555555-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','كرسي ١','chair'),
 ('55555555-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','كرسي ٢','chair'),
 ('55555555-0000-0000-0000-000000000003','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','كرسي ٣','chair'),
 ('55555555-0000-0000-0000-000000000004','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','كرسي ٤','chair');

-- ============ SERVICES ============
INSERT INTO public.services (id, tenant_id, branch_id, name, description, duration_minutes, buffer_minutes, price_cents, deposit_cents) VALUES
 ('66666666-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','كشف وتشخيص','فحص شامل مع أشعة بانورامية عند الحاجة',30,5,25000,10000),
 ('66666666-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','تنظيف وتلميع','إزالة الجير وتلميع الأسنان',45,5,45000,15000),
 ('66666666-0000-0000-0000-000000000003','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','حشو تجميلي','حشو ضوئي بلون الأسنان',60,10,60000,20000),
 ('66666666-0000-0000-0000-000000000004','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','علاج جذور','علاج عصب لجلسة واحدة',90,10,120000,40000),
 ('66666666-0000-0000-0000-000000000005','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','خلع بسيط','خلع سن بتخدير موضعي',30,10,35000,10000),
 ('66666666-0000-0000-0000-000000000006','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','خلع جراحي','خلع ضرس عقل مدفون',90,15,180000,60000),
 ('66666666-0000-0000-0000-000000000007','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','تركيب تقويم','تركيب جهاز تقويم ثابت',120,15,350000,120000),
 ('66666666-0000-0000-0000-000000000008','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','متابعة تقويم','شد وضبط أسلاك التقويم',30,5,50000,15000),
 ('66666666-0000-0000-0000-000000000009','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','تبييض بالليزر','جلسة تبييض بالليزر البارد',60,10,250000,80000),
 ('66666666-0000-0000-0000-000000000010','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','عدسات أسنان','تحضير وتركيب عدسة واحدة',90,10,400000,150000),
 ('66666666-0000-0000-0000-000000000011','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','حشو أطفال','حشو وقائي للأسنان اللبنية',30,5,30000,10000),
 ('66666666-0000-0000-0000-000000000012','22222222-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','فلورايد للأطفال','جلسة وقاية بالفلورايد',30,5,20000,8000);

INSERT INTO public.staff_services (tenant_id, staff_id, service_id)
SELECT '22222222-0000-0000-0000-000000000001', st.id, sv.id
FROM public.staff st
JOIN public.services sv ON sv.tenant_id = st.tenant_id
WHERE st.tenant_id = '22222222-0000-0000-0000-000000000001'
  AND (
    (st.specialty = 'استشاري' AND sv.name IN ('كشف وتشخيص','تنظيف وتلميع','حشو تجميلي','علاج جذور','خلع بسيط','خلع جراحي'))
 OR (st.specialty = 'تجميل أسنان' AND sv.name IN ('كشف وتشخيص','تنظيف وتلميع','حشو تجميلي','تبييض بالليزر','عدسات أسنان'))
 OR (st.specialty = 'تقويم' AND sv.name IN ('كشف وتشخيص','تركيب تقويم','متابعة تقويم','خلع بسيط'))
 OR (st.specialty = 'أسنان أطفال' AND sv.name IN ('كشف وتشخيص','حشو أطفال','فلورايد للأطفال','تنظيف وتلميع'))
  );

-- ============ AVAILABILITY (السبت..الخميس 9:00–21:00) ============
INSERT INTO public.availability_rules (tenant_id, staff_id, weekday, start_minute, end_minute)
SELECT '22222222-0000-0000-0000-000000000001', st.id, wd, 540, 1260
FROM public.staff st, unnest(ARRAY[0,1,2,3,4,6]) AS wd
WHERE st.tenant_id = '22222222-0000-0000-0000-000000000001';

INSERT INTO public.blackout_dates (tenant_id, staff_id, starts_at, ends_at, reason)
VALUES ('22222222-0000-0000-0000-000000000001','44444444-0000-0000-0000-000000000003',
        (CURRENT_DATE + 9)::timestamp AT TIME ZONE 'Africa/Cairo',
        (CURRENT_DATE + 12)::timestamp AT TIME ZONE 'Africa/Cairo','إجازة سنوية');

-- ============ CUSTOMERS ============
INSERT INTO public.customers (tenant_id, full_name, phone) VALUES
 ('22222222-0000-0000-0000-000000000001','محمود عبد الله','+201001234567'),
 ('22222222-0000-0000-0000-000000000001','نورهان سعيد','+201002234567'),
 ('22222222-0000-0000-0000-000000000001','كريم فتحي','+201003234567'),
 ('22222222-0000-0000-0000-000000000001','سلمى عادل','+201004234567'),
 ('22222222-0000-0000-0000-000000000001','يوسف حمدان','+201005234567'),
 ('22222222-0000-0000-0000-000000000001','هالة مصطفى','+201006234567'),
 ('22222222-0000-0000-0000-000000000001','عمر الديب','+201007234567'),
 ('22222222-0000-0000-0000-000000000001','ريم الشاذلي','+201008234567'),
 ('22222222-0000-0000-0000-000000000001','طارق منصور','+201009234567'),
 ('22222222-0000-0000-0000-000000000001','دينا الجندي','+201010234567'),
 ('22222222-0000-0000-0000-000000000001','أحمد رشدي','+201011234567'),
 ('22222222-0000-0000-0000-000000000001','منى إبراهيم','+201012234567'),
 ('22222222-0000-0000-0000-000000000001','باسم قنديل','+201013234567'),
 ('22222222-0000-0000-0000-000000000001','ياسمين طلعت','+201014234567'),
 ('22222222-0000-0000-0000-000000000001','مصطفى العدل','+201015234567'),
 ('22222222-0000-0000-0000-000000000001','فاطمة الزهراء','+201016234567'),
 ('22222222-0000-0000-0000-000000000001','زياد الشناوي','+201017234567'),
 ('22222222-0000-0000-0000-000000000001','ملك حسين','+201018234567'),
 ('22222222-0000-0000-0000-000000000001','حسام سليم','+201019234567'),
 ('22222222-0000-0000-0000-000000000001','آية عبد الرحمن','+201020234567');

-- ============ APPOINTMENTS ============
DO $seed$
DECLARE
  t uuid := '22222222-0000-0000-0000-000000000001';
  b uuid := '33333333-0000-0000-0000-000000000001';
  staff_ids uuid[];
  resource_ids uuid[];
  cust_ids uuid[];
  svc record;
  d date;
  slot_min int;
  idx int;
  si int;
  st_id uuid;
  res_id uuid;
  c_id uuid;
  starts timestamptz;
  status public.appointment_status;
  n int := 0;
BEGIN
  SELECT array_agg(id ORDER BY full_name) INTO staff_ids FROM public.staff WHERE tenant_id = t;
  SELECT array_agg(id ORDER BY name) INTO resource_ids FROM public.resources WHERE tenant_id = t;
  SELECT array_agg(id ORDER BY full_name) INTO cust_ids FROM public.customers WHERE tenant_id = t;

  FOR d IN SELECT generate_series(CURRENT_DATE - 120, CURRENT_DATE + 6, '1 day')::date LOOP
    IF EXTRACT(DOW FROM d) = 5 THEN CONTINUE; END IF;
    FOR idx IN 0..13 LOOP
      si := (idx + EXTRACT(DAY FROM d)::int) % 4 + 1;
      slot_min := 540 + idx * 45;
      EXIT WHEN slot_min + 45 > 1260;
      -- كثافة أقل في الأيام التاريخية البعيدة
      IF d < CURRENT_DATE - 7 AND (idx + EXTRACT(DAY FROM d)::int) % 3 <> 0 THEN CONTINUE; END IF;

      SELECT * INTO svc FROM public.services s
        JOIN public.staff_services ss ON ss.service_id = s.id AND ss.staff_id = staff_ids[si]
        ORDER BY md5(s.id::text || d::text || idx::text) LIMIT 1;
      CONTINUE WHEN svc IS NULL;

      st_id := staff_ids[si];
      res_id := resource_ids[si];
      c_id := cust_ids[((idx * 7 + EXTRACT(DAY FROM d)::int) % array_length(cust_ids,1)) + 1];
      starts := (d + make_interval(mins => slot_min))::timestamp AT TIME ZONE 'Africa/Cairo';

      IF d < CURRENT_DATE THEN
        status := (ARRAY['completed','completed','completed','no_show','cancelled']::public.appointment_status[])[(idx % 5) + 1];
      ELSIF d = CURRENT_DATE THEN
        status := (ARRAY['confirmed','confirmed','pending_deposit']::public.appointment_status[])[(idx % 3) + 1];
      ELSE
        status := (ARRAY['confirmed','pending_deposit']::public.appointment_status[])[(idx % 2) + 1];
      END IF;

      INSERT INTO public.appointments
        (tenant_id, branch_id, staff_id, service_id, customer_id, resource_id, starts_at, ends_at,
         status, price_cents, deposit_cents, deposit_paid_cents)
      VALUES (t, b, st_id, svc.id, c_id, res_id, starts, starts + make_interval(mins => svc.duration_minutes),
         status, svc.price_cents, svc.deposit_cents,
         CASE WHEN status = 'pending_deposit' THEN 0 ELSE svc.deposit_cents END)
      ON CONFLICT DO NOTHING;
      n := n + 1;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'seeded % appointments', n;
END $seed$;

INSERT INTO public.appointment_events (tenant_id, appointment_id, event_type, payload)
SELECT tenant_id, id, 'created', jsonb_build_object('source','seed') FROM public.appointments;

-- ============ انضمام أول مستخدم للعيادة التجريبية ============
CREATE OR REPLACE FUNCTION public.claim_demo_membership(_role public.app_role DEFAULT 'owner')
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t uuid := '22222222-0000-0000-0000-000000000001';
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _role NOT IN ('receptionist','provider','branch_manager','owner') THEN
    RAISE EXCEPTION 'invalid demo role';
  END IF;
  INSERT INTO public.memberships (user_id, tenant_id, role)
  VALUES (uid, t, _role) ON CONFLICT DO NOTHING;
  RETURN t;
END; $$;
REVOKE ALL ON FUNCTION public.claim_demo_membership(public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_demo_membership(public.app_role) TO authenticated;