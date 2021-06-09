export type Snippet = {
  version: "20210604";
  title?: string;
  content: string;
  timestamp: number;
};

export type Requirement = {
  token: string;
  networkId: number;
  amount: string; // should be good to parsed into BigNumber
};

export type UploadReturn = {
  encrypted: EncryptedSnippet;
  hash: string;
  privateKey: string;
};

export type UnlockedSnippet = Snippet & { owner: string };
export type SnipperForShowing = UnlockedSnippet;

export type EncryptedSnippet = {
  iv: string;
  content: string;
  owner: string;
};
