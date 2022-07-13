import うたらば from "./utalover";

describe("utalover", () => {
  it("crawl", async () => {
    const events = await うたらば.crawl();
    expect(events).toHaveLength(2);
    expect(events).toEqual([
      {
        key: expect.any(String),
        date: [2022, 7, 2],
        detail: {
          collection: "月刊うたらば",
          theme: "会",
        },
      },
      {
        key: expect.any(String),
        date: [2022, 7, 23],
        detail: {
          collection: "フリーペーパーうたらば",
          theme: "飲み物",
        },
      },
    ]);

    expect(new Set(events.map((r) => うたらば.eventDetail(r)))).toEqual(
      new Set([
        { title: "フリーペーパーうたらば『飲み物』", url: "https://www.utalover.com/" },
        { title: "月刊うたらば『会』", url: "https://www.utalover.com/" },
      ])
    );
  });
});
