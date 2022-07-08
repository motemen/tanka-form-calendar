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
import { encode } from "html-entities";

export interface Env {
  STORE: KVNamespace;
  SECRET_TOKEN: string;
}

const html = `<!DOCTYPE html>
<head>
  <title>投稿短歌カレンダー</title>
</head>
<body>
  <h1>投稿短歌カレンダー</h1>
  <p>インターネットで投稿できる短歌の締め切りを確認できるカレンダーです。</p>
  <p>現在、以下のサイトに対応しています:</p>
  <ul>
  ${SITES.map((site) => `<li><a href="${encode(site.homepage)}" target="_blank">${encode(site.name)}</a></li>`).join(
    "\n"
  )}
  </ul>
  <p>以下のURLをカレンダーアプリなどから利用してください。</p>
  <p><code>https://tanka-form-calendar.motemen.workers.dev/calendar.ics</code></p>
  <p><iframe src="https://calendar.google.com/calendar/embed?src=gmd5lma3ot21h8theu8nqndp4emubcgp%40import.calendar.google.com&ctz=Asia%2FTokyo" style="border: 0" width="800" height="600" frameborder="0" scrolling="no"></iframe></p>
  <footer>
    <address>Author: <a href="https://twitter.com/@motemen" target="_blank">@motemen</a></address>
    <a href="https://github.com/motemen/tanka-form-calendar/issues/new" target="_blank">ご意見ご要望</a>
  </footer>
</body>
`;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    console.log(JSON.stringify(env));
    if (url.pathname === "/_schedule") {
      if (url.searchParams.get("key") === env.SECRET_TOKEN) {
        await this.scheduled(null as unknown as ScheduledController, env, ctx);
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
          description: entry.url,
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

  async scheduled(controller: ScheduledController, env: Env, _ctx: ExecutionContext): Promise<void> {
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
