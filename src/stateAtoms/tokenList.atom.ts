import axios from "axios";
import { atom, selector } from "recoil";
import { StandardTokenList } from "../typing";
import { chainIdState } from "./chainId.atom";

export const selectedTokenListState = atom<string>({
  key: "selectedTokenListState",
  default:
    "https://unpkg.com/@lychees/default-token-list@1.1.10/build/uniscam-default.tokenlist.json",
});

export const customTokenListState = atom({
  key: "customTokenListState", // unique ID (with respect to other atoms/selectors)
  default: {}, // default value (aka initial value), default is empty
});

export const currentTokenList = selector({
  key: "currentTokenList",
  get: async ({ get }) => {
    const { data } = await axios.get<StandardTokenList>(
      get(selectedTokenListState)
    );
    const selectedChainId = get(chainIdState);
    const onlyCurrentChain = data.tokens.filter(
      (t) => t.chainId === selectedChainId
    );
    return onlyCurrentChain;
  },
});
