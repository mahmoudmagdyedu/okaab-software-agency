import { Outlet, createFileRoute } from "@tanstack/react-router";

/*
 * تخطيط /pos — مسار أب فقط.
 * شاشة الكاشير نفسها في pos.index.tsx، وبقية الحالات
 * (pin / payment / held / offline / loading / empty) أبناء يُعرضون عبر Outlet.
 */
export const Route = createFileRoute("/pos")({
  component: PosLayout,
});

function PosLayout() {
  return <Outlet />;
}
