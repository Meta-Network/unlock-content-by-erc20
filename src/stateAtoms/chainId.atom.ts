import { atom } from "recoil";
import { ChainId } from "../constant";

export const chainIdState = atom({
  key: "chainIdState", // unique ID (with respect to other atoms/selectors)
  default: ChainId.MAINNET, // default value (aka initial value), default is ETH mainnet
});
