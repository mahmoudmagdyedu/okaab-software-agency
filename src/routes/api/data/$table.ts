import { createFileRoute } from "@tanstack/react-router";

import { handleDataRequest, type DataRequest } from "@/lib/data-api.server";

export const Route = createFileRoute("/api/data/$table")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        try {
          const result = await handleDataRequest(
            params.table,
            (await request.json()) as DataRequest,
          );
          return Response.json(result, { headers: { "cache-control": "no-store" } });
        } catch (error) {
          if (error instanceof Response) return error;
          console.error("Okaab data API failed", error);
          const message =
            error instanceof Error && process.env["NODE_ENV"] !== "production"
              ? error.message
              : "تعذّر تنفيذ العملية";
          return Response.json({ data: null, count: null, error: { message } }, { status: 400 });
        }
      },
    },
  },
});
