import { CrawlResult, SiteBase } from "./base";

const FORM_URL = "https://www.utalover.com/join/toko/form.html";

export default new (class extends SiteBase {
  override name = "うたらば";

  override homepage = "https://www.utalover.com/";

  override keys(): string[] {
    return [...this.generateKeys("utalover-monthly"), ...this.generateKeys("utalover-freepaper")];
  }

  async crawl(): Promise<CrawlResult[]> {
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

    const buildEntry = (match: RegExpMatchArray, collection: string, keyPrefix: string): CrawlResult => {
      const [year, month, day] = match.slice(2).map((n) => parseInt(n));
      return {
        key: this.generateKey(keyPrefix, [year, month, day]),
        collection,
        theme: match[1],
        date: [year, month, day],
        url: FORM_URL,
      };
    };

    return [
      buildEntry(matchMonthly, "月刊うたらば", "utalover-monthly"),
      buildEntry(matchFreepaper, "フリーペーパーうたらば", "utalover-freepaper"),
    ];
  }
})();
