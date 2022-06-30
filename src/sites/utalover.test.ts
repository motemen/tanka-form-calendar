import うたらば from "./utalover";

describe("utalover", () => {
  it("crawl", async () => {
    const results = await うたらば.crawl();
    expect(results).toHaveLength(2);
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collection: "月刊うたらば",
        }),
        expect.objectContaining({
          collection: "フリーペーパーうたらば",
        }),
      ])
    );
  });
});
