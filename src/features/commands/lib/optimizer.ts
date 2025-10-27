const isMove = (c: string) => ["Л", "П", "В", "Н"].includes(c);

export function normalizeInput(s: string): string {
  return Array.from(s.toUpperCase())
    .filter((ch) => "ЛПВНОБ".includes(ch))
    .join("");
}

export const rleEncode = (cmd: string): string => {
  if (!cmd) return "";

  let res = "";
  for (let i = 0; i < cmd.length; ) {
    const ch = cmd[i];
    if (!isMove(ch)) {
      res += ch;
      i++;
      continue;
    }

    const start = i;
    while (cmd[i] === ch) i++;
    const count = i - start;
    res += count > 1 ? `${count}${ch}` : ch;
  }

  return res;
};

function findBestRepeatBlock(rle: string): { replaced: string; saved: number } {
  let best = { replaced: rle, saved: 0 };
  const n = rle.length;
  for (let len = Math.floor(n / 2); len >= 2; len--) {
    for (let start = 0; start + 2 * len <= n; start++) {
      const block = rle.slice(start, start + len);
      let k = 2;
      while (
        start + k * len <= n &&
        rle.slice(start + (k - 1) * len, start + k * len) === block
      )
        k++;
      k--;
      if (k >= 2) {
        const before = rle;
        const grouped =
          before.slice(0, start) +
          `${k}(${block})` +
          before.slice(start + k * len);
        const saved = before.length - grouped.length;
        if (saved > best.saved) best = { replaced: grouped, saved };
      }
    }
    if (best.saved > 0) break;
  }
  return best;
}

export const optimize = (
  cmdRaw: string
): { normalized: string; rle: string; final: string } => {
  const normalized = normalizeInput(cmdRaw);
  const rle = rleEncode(normalized);
  const best = findBestRepeatBlock(rle);
  const final = best.saved > 0 ? best.replaced : rle;
  return { normalized, rle, final };
};
