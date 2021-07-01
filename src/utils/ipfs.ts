import axios from "axios";
import fleekStorage from "@fleekhq/fleek-storage-js";
import { v4 as randomUuid } from "uuid";
import FormData from "form-data";

export class IpfsClient {
  static async cat<T>(hash: string): Promise<T> {
    const getters = [this.catWithFleek, this.catWithInfura].map((fn) =>
      fn<T>(hash)
    );
    const res = await Promise.race(getters);
    return res;
  }

  static async upload(content: any): Promise<string> {
    const uploaders = [
      this._uploadToInfura,
      this._uploadToFleekCo,
      this._uploadToPinata,
    ].map((fn) => fn(content).catch(() => null));
    const res = await Promise.all(uploaders);
    const finishedUpload = res.filter((r) => r !== null) as string[];
    return finishedUpload[0];
  }

  private static async catWithInfura<T>(hash: string) {
    const { data } = await axios.post<T>(
      "https://ipfs.infura.io:5001/api/v0/cat",
      undefined,
      {
        timeout: 1000 * 15,
        params: { arg: hash },
      }
    );
    return data;
  }

  private static async catWithFleek<T>(hash: string) {
    const { data } = await axios.get<T>(`https://ipfs.fleek.co/ipfs/${hash}`);
    return data;
  }

  private static async _uploadToInfura(file: any) {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await axios.post<{
      Name: string;
      Hash: string;
      Size: string;
    }>("https://ipfs.infura.io:5001/api/v0/add", fd, {
      headers: fd.getHeaders(),
      timeout: 1000 * 15,
      params: { pin: "true" },
    });
    return data.Hash;
  }

  private static async _uploadToFleekCo(file: any) {
    const res = await fleekStorage.upload({
      apiKey: process.env.FLEEK_CO_KEY as string,
      apiSecret: process.env.FLEEK_CO_SECRET as string,
      key: randomUuid(),
      data: file,
    });
    return res.hashV0;
  }

  private static async _uploadToPinata(f: any) {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const { data } = await axios.post<{
      IpfsHash: string;
      PinSize: number;
      Timestamp: string;
    }>(url, JSON.parse(f), {
      headers: {
        pinata_api_key: process.env.PINATA_KEY,
        pinata_secret_api_key: process.env.PINATA_KEY_SECRET,
      },
    });
    return data.IpfsHash;
  }
}
