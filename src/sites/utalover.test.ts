import うたらば from "./utalover";

describe("utalover", () => {
  it("crawl", async () => {
    const events = await うたらば.crawl();
    expect(events).toMatchSnapshot();

    expect(new Set(events.map((r) => うたらば.eventDetail(r)))).toEqual(
      new Set([
        { title: "フリーペーパーうたらば『飲み物』", url: "https://www.utalover.com/" },
        { title: "月刊うたらば『会』", url: "https://www.utalover.com/" },
      ])
    );
  });
});
