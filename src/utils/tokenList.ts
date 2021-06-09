import axios from "axios";
import { StandardTokenList } from "../typing";

export async function getTokenList(url: string) {
  const { data } = await axios.get<StandardTokenList>(url);
  return data;
}
