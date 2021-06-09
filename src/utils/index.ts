import axios from "axios";

export const axiosSWRFetcher = (url: string) =>
  axios.get(url).then((r) => r.data);
