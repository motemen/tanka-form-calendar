import addMonths from "date-fns/addMonths";

export abstract class SiteBase {
  public abstract readonly name: string;

  public abstract readonly homepage: string;

  protected generateKey(keyPrefix: string, [year, month]: [number, number, number]): string {
    return `${keyPrefix}:${year}${month.toString().padStart(2, "0")}`;
  }

  protected generateKeys(keyPrefix: string): string[] {
    let d = addMonths(Date.now(), +2);
    const keys = <string[]>[];
    for (let i = 0; i < 6; i++) {
      keys.push(this.generateKey(keyPrefix, [d.getFullYear(), d.getMonth() + 1, d.getDate()]));
      d = addMonths(d, -1);
    }
    return keys;
  }

  abstract keys(): string[];

  abstract crawl(): Promise<CrawlResult[]>;
}

export interface CrawlResult {
  key: string;
  date: [number, number, number];
  collection: string;
  theme: string;
  url: string;
}
