import { computeDigest } from "../utils";
import { TankaEvent, TankaSite } from "./base";

const FORM_URL = "https://www.utalover.com/join/toko/form.html";

interface Detail extends Record<string, unknown> {
  collection: "月刊うたらば" | "フリーペーパーうたらば";
  theme: string;
}

const うたらば: TankaSite<Detail> = {
  key: "utalover",
  homepage: "https://www.utalover.com/",
  name: "うたらば",

  async crawl(): Promise<TankaEvent<Detail>[]> {
    const resp = await fetch(FORM_URL);
    const text = (await resp.text()).replace(/<[^>]+>/g, "");

    const matchMonthly = /月刊うたらば：『(.+?)』（締切：([0-9]+)\/([0-9]+)\/([0-9]+)/.exec(text);
    if (!matchMonthly) {
      throw new Error("Could not parse monthly");
    }

    const matchFreepaper = /フリーペーパー：『(.+?)』（締切：([0-9]+)\/([0-9]+)\/([0-9]+)/.exec(text);
    if (!matchFreepaper) {
      throw new Error("Could not parse free paper");
    }

    const buildEntry = async (
      match: RegExpMatchArray,
      collection: "月刊うたらば" | "フリーペーパーうたらば",
      keyPrefix: string
    ): Promise<TankaEvent<Detail>> => {
      const [year, month, day] = match.slice(2).map((n) => parseInt(n));
      return {
        key: await computeDigest(`${keyPrefix}/${year}-${month}-${day}`),
        date: [year, month, day],
        detail: {
          collection,
          theme: match[1],
        },
      };
    };

    return [
      await buildEntry(matchMonthly, "月刊うたらば", "utalover-monthly"),
      await buildEntry(matchFreepaper, "フリーペーパーうたらば", "utalover-freepaper"),
    ];
  },

  eventDetail({ detail }: TankaEvent<Detail>): { title: string; url: string } {
    return {
      title: `${detail.collection}『${detail.theme}』`,
      url: this.homepage,
    };
  },
};

export default うたらば;
