import NHK短歌 from "./nhk";

describe("nhk-tanka", () => {
  it("crawl", async () => {
    const events = await NHK短歌.crawl();
    expect(new Set(events.map((x) => x.key)).size).toBe(4);
    expect(new Set(events)).toEqual(
      new Set([
        {
          key: expect.any(String),
          date: [2022, 7, 7],
          detail: {
            selector: "江戸雪",
            theme: "記念日（テーマ）",
          },
        },
        {
          key: expect.any(String),
          date: [2022, 7, 7],
          detail: {
            selector: "佐佐木定綱",
            theme: "焼",
          },
        },
        {
          key: expect.any(String),
          date: [2022, 7, 21],
          detail: {
            selector: "栗木京子",
            theme: "カラオケ（テーマ）",
          },
        },
        {
          key: expect.any(String),
          date: [2022, 7, 21],
          detail: {
            selector: "笹公人",
            theme: "魚料理（テーマ）",
          },
        },
      ])
    );
  });
});
