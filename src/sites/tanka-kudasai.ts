import { fixupYMD } from "../utils";
import { CrawlResult, SiteBase } from "./base";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdZcsuMp2sRfAgMkB_MWqHsT_zi-Jt9Ed3PyRxZg2fGVPtjhg/viewform";

export default new (class extends SiteBase {
  override name = "短歌ください";

  override homepage = "https://ddnavi.com/davinci/tanka/";

  override keys(): string[] {
    return this.generateKeys("tanka-kudasai");
  }

  override async crawl(): Promise<CrawlResult[]> {
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
        key: this.generateKey("tanka-kudasai", [year, month, day]),
        collection: "短歌ください",
        date: [year, month, day],
        theme: themeMatch[1],
        url: FORM_URL,
      },
    ];
  }
})();
