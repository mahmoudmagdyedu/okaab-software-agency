export function apiData(data: unknown, init?: ResponseInit) {
  return Response.json(
    { data, error: null },
    { ...init, headers: { "cache-control": "no-store", ...init?.headers } },
  );
}

export function apiError(error: unknown, fallback = "تعذّر تنفيذ الطلب") {
  if (error instanceof ApiProblem) {
    return Response.json(
      { data: null, error: { message: error.message } },
      { status: error.status, headers: { "cache-control": "no-store" } },
    );
  }
  if (typeof error === "object" && error !== null && "name" in error && error.name === "ZodError") {
    return Response.json(
      { data: null, error: { message: "راجع البيانات المُرسلة وحاول مرة أخرى" } },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }
  if (error instanceof Response) {
    return Response.json(
      { data: null, error: { message: error.statusText || fallback } },
      { status: error.status, headers: { "cache-control": "no-store" } },
    );
  }
  console.error(error);
  return Response.json(
    { data: null, error: { message: fallback } },
    { status: 500, headers: { "cache-control": "no-store" } },
  );
}
export class ApiProblem extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiProblem";
  }
}
