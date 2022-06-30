import { Polly } from "@pollyjs/core";
import FetchAdapter from "@pollyjs/adapter-fetch";
import FileSystemPersister from "@pollyjs/persister-fs";

Polly.register(FetchAdapter);
Polly.register(FileSystemPersister);

let polly: Polly | undefined;

beforeEach(() => {
  console.log(expect.getState().currentTestName);
  polly = new Polly(expect.getState().currentTestName, {
    adapters: ["fetch"],
    persister: "fs",
    logLevel: "error",
  });
  polly.configure({
    persisterOptions: {
      fs: {
        recordingsDir: "__recordings__",
      },
    },
    recordIfMissing: process.env.CI ? false : true,
  });
});

afterEach(async () => {
  await polly?.stop();
});
