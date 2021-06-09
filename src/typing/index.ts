export type Snippet = {
  version: "20210604";
  title?: string;
  content: string;
  timestamp: number;
};

export type RequirementV1 = {
  version: "20210609";
  type: 'hodl';
  token: string;
  networkId: number;
  amount: string; // should be good to parsed into BigNumber
};

export type Requirement = RequirementV1;

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
