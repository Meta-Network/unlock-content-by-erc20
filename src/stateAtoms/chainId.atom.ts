import { atom } from "recoil";

export const chainIdState = atom({
  key: "chainIdState", // unique ID (with respect to other atoms/selectors)
  default: 1, // default value (aka initial value), default is ETH mainnet
});
