type Filter = { operator: "eq" | "is" | "in" | "gte" | "lt"; column: string; value: unknown };
type DataValue = Record<string, unknown> | Record<string, unknown>[] | null;
type Result = { data: DataValue; count: number | null; error: { message: string } | null };

class QueryBuilder implements PromiseLike<Result> {
  private request = {
    operation: "select" as "select" | "insert" | "update" | "delete",
    columns: "*",
    values: undefined as unknown,
    filters: [] as Filter[],
    orders: [] as { column: string; ascending?: boolean }[],
    limit: undefined as number | undefined,
    head: false,
    count: undefined as "exact" | undefined,
    single: undefined as "single" | "maybe" | undefined,
  };

  constructor(private table: string) {}
  select(columns = "*", options?: { count?: "exact"; head?: boolean }) {
    this.request.columns = columns;
    this.request.count = options?.count;
    this.request.head = options?.head ?? false;
    return this;
  }
  insert(values: unknown) {
    this.request.operation = "insert";
    this.request.values = values;
    return this;
  }
  update(values: unknown) {
    this.request.operation = "update";
    this.request.values = values;
    return this;
  }
  delete() {
    this.request.operation = "delete";
    return this;
  }
  eq(column: string, value: unknown) {
    this.request.filters.push({ operator: "eq", column, value });
    return this;
  }
  is(column: string, value: unknown) {
    this.request.filters.push({ operator: "is", column, value });
    return this;
  }
  in(column: string, value: unknown[]) {
    this.request.filters.push({ operator: "in", column, value });
    return this;
  }
  gte(column: string, value: unknown) {
    this.request.filters.push({ operator: "gte", column, value });
    return this;
  }
  lt(column: string, value: unknown) {
    this.request.filters.push({ operator: "lt", column, value });
    return this;
  }
  order(column: string, options?: { ascending?: boolean }) {
    this.request.orders.push(
      options?.ascending === undefined ? { column } : { column, ascending: options.ascending },
    );
    return this;
  }
  limit(value: number) {
    this.request.limit = value;
    return this;
  }
  single() {
    this.request.single = "single";
    return this;
  }
  maybeSingle() {
    this.request.single = "maybe";
    return this;
  }

  async execute(): Promise<Result> {
    try {
      const response = await fetch(`/api/data/${encodeURIComponent(this.table)}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(this.request),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok)
        return {
          data: null,
          count: null,
          error: { message: payload?.error?.message || "غير مصرح بهذه العملية" },
        };
      return payload as Result;
    } catch (error) {
      return {
        data: null,
        count: null,
        error: { message: error instanceof Error ? error.message : "تعذّر الاتصال بالخادم" },
      };
    }
  }

  then<TResult1 = Result, TResult2 = never>(
    onfulfilled?: ((value: Result) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const okaab = { from: (table: string) => new QueryBuilder(table) };
