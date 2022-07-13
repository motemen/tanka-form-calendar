import 短歌ください from "./tanka-kudasai";

describe("tanka-kudasai", () => {
  it("crawl", async () => {
    const events = await 短歌ください.crawl();
    expect(events).toHaveLength(1);
    expect(events).toEqual([
      {
        key: expect.any(String),
        date: [2022, 6, 30],
        detail: {
          theme: "ぴょんぴょん",
        },
      },
    ]);
  });
});
