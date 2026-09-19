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
          if (error instanceof Response) {
            const status = error.status;
            const text = await error.text();
            return Response.json(
              { data: null, count: null, error: { message: text || error.statusText || "تعذّر تنفيذ العملية" } },
              { status, headers: { "cache-control": "no-store" } },
            );
          }
          console.error("Okaab data API failed", error);
          return Response.json(
            { data: null, count: null, error: { message: "تعذّر تنفيذ العملية" } },
            { status: 400, headers: { "cache-control": "no-store" } },
          );
        }
      },
    },
  },
});
