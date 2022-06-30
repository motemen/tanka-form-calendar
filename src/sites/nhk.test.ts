import NHK短歌 from "./nhk";

describe("nhk-tanka", () => {
  it("crawl", async () => {
    const results = await NHK短歌.crawl();
    expect(results).toHaveLength(4);
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: expect.stringMatching(/^nhk-tanka_0/),
        }),
        expect.objectContaining({
          key: expect.stringMatching(/^nhk-tanka_1/),
        }),
        expect.objectContaining({
          key: expect.stringMatching(/^nhk-tanka_2/),
        }),
        expect.objectContaining({
          key: expect.stringMatching(/^nhk-tanka_3/),
        }),
      ])
    );
  });
});
