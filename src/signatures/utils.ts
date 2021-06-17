const DEADLINE_LIMIT = 2; // 2 MIN

export function getDeadline(mins: number = DEADLINE_LIMIT) {
  return Math.floor(Date.now() / 1000) + 60 * mins;
}

export function checkDeadline(deadline: number) {
  const now = Date.now() / 1000;
  // `now` should be smaller than
  if (now > deadline) {
    throw new Error("Your signature was expired, please sign & submit again.");
  }
}
