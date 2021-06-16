import axios from "axios";

type ReCaptchaResponse = {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  "error-codes": string[];
};

export async function verifyRecaptcha(
  userGivenToken: string,
  remoteip?: string
) {
  const { data } = await axios.post<ReCaptchaResponse>(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      secret: process.env.RECATCHA_SERVER_KEY,
      response: userGivenToken,
      remoteip,
    }
  );
  return data;
}
