export type EventTypeOf<S> = S extends TankaSite<infer D> ? TankaEvent<D> : never;

export interface TankaSite<D extends Record<string, unknown>> {
  key: string;
  homepage: string;
  name: string;
  crawl(): Promise<TankaEvent<D>[]>;
  eventDetail(event: TankaEvent<D>): { title: string; url: string };
}

export interface TankaEvent<D extends Record<string, unknown> = Record<string, unknown>> {
  date: [number, number, number];
  key: string;
  detail: D;
}
