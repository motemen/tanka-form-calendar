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

  it("keys", async () => {
    const spy = jest.spyOn(Date, "now").mockImplementation(() => new Date(2022, 7, 7).getTime());
    Date.now = jest.fn(() => new Date(2022, 7, 7).getTime());

    const keys = NHK短歌.keys();
    expect(new Set(keys)).toEqual(
      new Set([
        "nhk-tanka_0:202205",
        "nhk-tanka_0:202206",
        "nhk-tanka_0:202207",
        "nhk-tanka_0:202208",
        "nhk-tanka_0:202209",
        "nhk-tanka_0:202210",
        "nhk-tanka_1:202205",
        "nhk-tanka_1:202206",
        "nhk-tanka_1:202207",
        "nhk-tanka_1:202208",
        "nhk-tanka_1:202209",
        "nhk-tanka_1:202210",
        "nhk-tanka_2:202205",
        "nhk-tanka_2:202206",
        "nhk-tanka_2:202207",
        "nhk-tanka_2:202208",
        "nhk-tanka_2:202209",
        "nhk-tanka_2:202210",
        "nhk-tanka_3:202205",
        "nhk-tanka_3:202206",
        "nhk-tanka_3:202207",
        "nhk-tanka_3:202208",
        "nhk-tanka_3:202209",
        "nhk-tanka_3:202210",
      ])
    );
    spy.mockRestore();
  });
});
