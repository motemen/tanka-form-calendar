import { SITES } from "./sites";
import { EventTypeOf } from "./sites/base";
import ical, { ICalCalendar } from "ical-generator";
import h from "vhtml";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Fragment = ({ children }: { children: string[] }) =>
  h(null as unknown as string, null, ...children);

export interface Env {
  STORE: KVNamespace;
  SECRET_TOKEN: string;
}

async function buildIndexHTML(kv: KVNamespace): Promise<string> {
  const crawlResults = await Promise.all(
    SITES.map(async (site) => {
      const events = await kv.get<EventTypeOf<typeof site>[]>(
        `events:${site.key}`,
        { type: "json" }
      );
      return {
        site,
        events:
          events?.filter((ev): ev is NonNullable<typeof ev> => !!ev) ?? [],
      };
    })
  );

  const html = (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>投稿短歌カレンダー</title>
      </head>
      <body>
        <h1>投稿短歌カレンダー</h1>
        <p>ウェブで投稿できる短歌の締め切りを確認できるカレンダーです。</p>
        <p>現在、以下のサイトに対応しています:</p>
        <ul>
          {crawlResults.map(({ site, events }) => (
            <li>
              <strong>
                <a href={site.homepage} target="_blank">
                  {site.name}
                </a>
              </strong>
              <ul>
                {events
                  .map((ev) => ({ date: ev.date, ...site.eventDetail(ev) }))
                  .map(({ date, title, url }) => (
                    <li>
                      <a href={url} target="_blank">
                        {title}
                      </a>{" "}
                      {date[0]}/{date[1]}/{date[2]}
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ul>
        <p>以下のURLをカレンダーアプリなどから利用してください。</p>
        <p>
          <code>
            https://tanka-form-calendar.motemen.workers.dev/calendar.ics
          </code>
        </p>
        <p>
          <iframe
            src="https://calendar.google.com/calendar/u/0/embed?src=0rfhaeq9n91cr7bt89ddbgfco1oeaqoq@import.calendar.google.com&ctz=Asia/Tokyo"
            style="border: 0; max-width: 100%;"
            width="800"
            height="600"
            frameborder="0"
            scrolling="no"
          ></iframe>
        </p>
        <footer>
          <address>
            Author:{" "}
            <a href="https://twitter.com/@motemen" target="_blank">
              @motemen
            </a>
          </address>
          <a
            href="https://github.com/motemen/tanka-form-calendar"
            target="_blank"
          >
            Source
          </a>
        </footer>
      </body>
    </html>
  );

  return `<!DOCTYPE html>${html}`;
}

async function buildICal(kv: KVNamespace): Promise<ICalCalendar> {
  const crawlResults = await Promise.all(
    SITES.map(async (site) => {
      const events = await kv.get<EventTypeOf<typeof site>[]>(
        `events:${site.key}`,
        { type: "json" }
      );
      return {
        site,
        events:
          events?.filter((ev): ev is NonNullable<typeof ev> => !!ev) ?? [],
      };
    })
  );

  const cal = ical({ name: "投稿短歌カレンダー", timezone: "Asia/Tokyo" });

  crawlResults.forEach(({ site, events }) => {
    console.log({ site, events });
    events.forEach((event) => {
      const { title, url } = site.eventDetail(event);
      cal.createEvent({
        id: `${site.key}-${event.key}@tanka-form-calendar.motemen.workers.dev`,
        summary: title,
        description: url,
        start: new Date(event.date[0], event.date[1] - 1, event.date[2]),
        allDay: true,
        timezone: "Asia/Tokyo",
      });
    });
  });

  return cal;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/_schedule") {
      if (url.searchParams.get("key") === env.SECRET_TOKEN) {
        await this.scheduled(null as unknown as ScheduledController, env, ctx);
        return new Response("schedule ran");
      }

      return new Response("Invalid token", { status: 401 });
    }

    if (url.pathname === "/calendar.ics") {
      const cal = await buildICal(env.STORE);

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
      return new Response(await buildIndexHTML(env.STORE), {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("302 Found", {
      status: 302,
      headers: { Location: "/" },
    });
  },

  async scheduled(
    controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    await Promise.all(
      SITES.map(async (site) => {
        const events = await site.crawl();
        await env.STORE.put(`events:${site.key}`, JSON.stringify(events));
        console.log(`${site.name}: done`);
      })
    );
  },
};
