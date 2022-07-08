import { fixupYMD } from "../utils";
import { CrawlResult, SiteBase } from "./base";
import { decodeHTML, decodeHTMLStrict } from "entities";

const TOP_URL = "https://www.nhk.jp/p/ts/JM12GR5RLP/";

export default new (class extends SiteBase {
  override name = "NHK短歌";

  override homepage = "https://www.nhk.jp/p/ts/JM12GR5RLP/";

  override keys(): string[] {
    return [0, 1, 2, 3].flatMap((i) => this.generateKeys(`nhk-tanka_${i}`));
  }

  async crawl(): Promise<CrawlResult[]> {
    console.debug(`NHK: crawl ${TOP_URL}`);

    const resp = await fetch(TOP_URL);
    const html = await resp.text();

    const matches = html.matchAll(
      /<a href="(https:\/\/forms\.nhk\.or\.jp\/q\/[^"]+)" target="_self">詳しくはこちら<\/a><\/p>/g
    );

    let index = 0;
    return Promise.all(
      [...matches].map(async ([, url]): Promise<CrawlResult[]> => {
        console.debug(`NHK: crawl ${url}`);

        const resp = await fetch(url);
        const text = await resp.text().then((t) => decodeHTML(t));

        const matchHTML = /enquete_data = ({.+});$/m.exec(text);
        if (!matchHTML) {
          throw new Error(`Could not find enquete data: ${url}`);
        }

        const enqueteData = JSON.parse(matchHTML[1]);

        // eg:
        // [
        //   "<p><span style=\"font-size:18px\">江戸　雪 「記念日（テーマ） または自由」 7/7(木)　午後1時締切</span></p>",
        //   "<p><span style=\"font-size:18px\">佐佐木　定綱 「焼　または自由」 7/7(木)　午後1時締切</span></p>"
        // ]
        const choices = enqueteData.questions[0][0].options.choices as unknown as string[];
        return choices.map((choice): CrawlResult => {
          choice = choice.replace(/<[^>]+>/g, "");

          const match = /^(.+)「(.+?)(?:\s*または自由)?」\s*([0-9]+)\/([0-9]+)/.exec(choice);
          if (!match) {
            throw new Error(`Could not match: ${choice}`);
          }

          const [, selector, theme, m, d] = match;
          const [year, month, day] = fixupYMD(parseInt(m), parseInt(d));

          return {
            collection: `NHK短歌 ${selector}`,
            date: [year, month, day],
            key: this.generateKey(`nhk-tanka_${index++}`, [year, month, day]),
            theme,
            url: TOP_URL,
          };
        });
      })
    ).then((x) => x.flat());
  }
})();
