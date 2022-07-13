import { computeDigest, fixupYMD } from "../utils";
import { TankaEvent, TankaSite } from "./base";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdZcsuMp2sRfAgMkB_MWqHsT_zi-Jt9Ed3PyRxZg2fGVPtjhg/viewform";

interface Detail extends Record<string, unknown> {
  theme: string;
}

const 短歌ください: TankaSite<Detail> = {
  key: "tanka-kudasai",
  homepage: "https://ddnavi.com/davinci/tanka/",
  name: "短歌ください",

  async crawl(): Promise<TankaEvent<Detail>[]> {
    const resp = await fetch(FORM_URL);
    const text = (await resp.text()).replace(/<[^>]+>/g, "");

    const themeMatch = /今回のテーマ『(.+?)』/.exec(text);
    if (!themeMatch) {
      throw new Error("Could not find theme");
    }

    const dateMatch = /締め切り.+?([0-9]+)月([0-9]+)日/.exec(text);
    if (!dateMatch) {
      throw new Error("Could not find date");
    }

    const [m, d] = dateMatch.slice(1).map((n) => parseInt(n));
    const [year, month, day] = fixupYMD(m, d);

    return [
      {
        key: await computeDigest(`${year}-${month}-${day}`),
        date: [year, month, day],
        detail: {
          theme: themeMatch[1],
        },
      },
    ];
  },

  eventDetail({ detail }: TankaEvent<Detail>): { title: string; url: string } {
    return {
      title: `短歌ください『${detail.theme}』`,
      url: this.homepage,
    };
  },
};

export default 短歌ください;
