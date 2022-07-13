import { computeDigest, fixupYMD } from "../utils";
import { TankaSite, TankaEvent } from "./base";
import { decodeHTML } from "entities";

const TOP_URL = "https://www.nhk.jp/p/ts/JM12GR5RLP/";

interface Detail extends Record<string, unknown> {
  selector: string;
  theme: string;
}

const NHK短歌: TankaSite<Detail> = {
  key: "nhk-tanka",
  homepage: TOP_URL,
  name: "NHK短歌",

  async crawl(): Promise<TankaEvent<Detail>[]> {
    console.debug(`NHK: crawl ${TOP_URL}`);

    const html = await fetch(TOP_URL).then((r) => r.text());

    const matches = html.matchAll(
      /<a href="(https:\/\/forms\.nhk\.or\.jp\/q\/[^"]+)" target="_self">詳しくはこちら<\/a><\/p>/g
    );

    const buildEvent = async (choice: string): Promise<TankaEvent<Detail>> => {
      choice = choice.replace(/<[^>]+>/g, "");

      const match = /^(.+)「(.+?)(?:\s*または自由)?」\s*([0-9]+)\/([0-9]+)/.exec(choice);
      if (!match) {
        throw new Error(`Could not match: ${choice}`);
      }

      const [, rawSelector, rawTheme, m, d] = match;
      const selector = decodeHTML(rawSelector).replaceAll(/\s+/g, "");
      const theme = decodeHTML(rawTheme);
      const [year, month, day] = fixupYMD(parseInt(m), parseInt(d));

      return {
        key: await computeDigest(`${year}/${month}/${day}/${selector}/${theme}`),
        date: [year, month, day],
        detail: {
          selector: selector.replaceAll(/\s+/g, ""),
          theme,
        },
      };
    };

    const crawlForm = async (formURL: string): Promise<TankaEvent<Detail>[]> => {
      console.debug(`NHK: crawlForm ${formURL}`);

      const text = await fetch(formURL)
        .then((r) => r.text())
        .then((t) => decodeHTML(t));

      const matchHTML = /enquete_data = ({.+});$/m.exec(text);
      if (!matchHTML) {
        throw new Error(`Could not find enquete data: ${formURL}`);
      }

      const enqueteData = JSON.parse(matchHTML[1]);

      // eg:
      // [
      //   "<p><span style=\"font-size:18px\">江戸　雪 「記念日（テーマ） または自由」 7/7(木)　午後1時締切</span></p>",
      //   "<p><span style=\"font-size:18px\">佐佐木　定綱 「焼　または自由」 7/7(木)　午後1時締切</span></p>"
      // ]
      const choices = enqueteData.questions[0][0].options.choices as unknown as string[];
      return Promise.all(choices.map(buildEvent));
    };

    return Promise.all([...matches].map(([, url]) => crawlForm(url))).then((x) => x.flat());
  },

  eventDetail({ detail }: TankaEvent<Detail>): { title: string; url: string } {
    return {
      title: `NHK短歌 ${detail.selector}『${detail.theme}』`,
      url: this.homepage,
    };
  },
};

export default NHK短歌;
