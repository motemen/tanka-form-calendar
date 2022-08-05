import NHK短歌 from "./nhk";

describe("nhk-tanka", () => {
  it("crawl", async () => {
    const events = await NHK短歌.crawl();
    expect(events).toMatchSnapshot();
  });
});
