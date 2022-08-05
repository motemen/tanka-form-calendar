import 短歌ください from "./tanka-kudasai";

describe("tanka-kudasai", () => {
  it("crawl", async () => {
    const events = await 短歌ください.crawl();
    expect(events).toMatchSnapshot();
  });
});
