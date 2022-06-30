import 短歌ください from "./tanka-kudasai";

describe("tanka-kudasai", () => {
  it("crawl", async () => {
    const results = await 短歌ください.crawl();
    expect(results).toHaveLength(1);
  });
});
