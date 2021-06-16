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
  const rqbody = {
    secret: process.env.RECATCHA_SERVER_KEY,
    response: userGivenToken,
    remoteip,
  };
  console.info("rqbody", rqbody);
  const { data } = await axios.post<ReCaptchaResponse>(
    "https://www.google.com/recaptcha/api/siteverify",
    undefined,
    { params: rqbody }
  );
  return data;
}
