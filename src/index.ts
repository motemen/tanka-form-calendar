/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

import { SITES } from "./sites";
import { CrawlResult } from "./sites/base";
import ical from "ical-generator";

export interface Env {
  STORE: KVNamespace;
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  SECRET_TOKEN: string;
}

const html = `
<!DOCTYPE html>
<body>
  <h1>投稿短歌カレンダー</h1>
  <p>インターネットで投稿できる短歌の締め切りを確認できるカレンダーです。</p>
  <p>以下のURLをカレンダーアプリなどから利用してください。</p>
  <p><code>https://tanka-form-calendar.motemen.workers.dev/calendar.ics</code></p>
  <p><iframe src="https://calendar.google.com/calendar/embed?src=gmd5lma3ot21h8theu8nqndp4emubcgp%40import.calendar.google.com&ctz=Asia%2FTokyo" style="border: 0" width="800" height="600" frameborder="0" scrolling="no"></iframe></p>
</body>
`;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/_schedule") {
      if (url.searchParams.get("token") === env.SECRET_TOKEN) {
        await this.scheduled(null as any, env, ctx);
        return new Response("schedule ran");
      }

      return new Response("Invalid token", { status: 401 });
    }

    if (url.pathname === "/calendar.ics") {
      const keys = SITES.flatMap((site) => site.keys());
      const entries = await Promise.all(keys.map((key) => env.STORE.get<CrawlResult>(key, { type: "json" })));
      console.debug({ keys, entries });

      const cal = ical({ name: "投稿短歌カレンダー", timezone: "Asia/Tokyo" });

      entries.forEach((entry) => {
        if (!entry) return null;

        cal.createEvent({
          summary: `${entry.collection}『${entry.theme}』`,
          start: new Date(entry.date[0], entry.date[1] - 1, entry.date[2]),
          allDay: true,
          timezone: "Asia/Tokyo",
          url: entry.url,
        });
      });

      return new Response(cal.toString(), {
        headers: {
          "Content-Type": "text/calendar",
        },
      });
    }

    if (url.pathname === "/favicon.ico") {
      return new Response("404 Not Found", { status: 404 });
    }

    if (url.pathname === "/") {
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    return new Response("302 Found", { status: 302, headers: { Location: "/" } });
  },

  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const results = await Promise.all(SITES.map((site) => site.crawl()));
    console.debug(results);
    await Promise.all(
      results.flat().map(async (result) => {
        await env.STORE.put(result.key, JSON.stringify(result), {
          expirationTtl: 3 * 30 * 24 * 60 * 60, // 3 months
        });
      })
    );
  },
};
