import fs from "fs";

const rows1 = fs
  .readFileSync("data/totalstrokes.txt", "utf-8")
  .split("\r\n")
  .filter((o) => o)
  .filter((o) => {
    const [codepoint] = o.split(" ");
    return parseInt(codepoint.slice(2), 16) >= 0x3400;
  });

const strokeCounts1 = new Map(
  rows1.map((o) => {
    const [codepoint, tsfs] = o.split(" ");
    const [ts] = tsfs.split("|");
    return [codepoint, ts];
  })
);

const rows2 = fs
  .readFileSync("data/source-code-separation.txt", "utf-8")
  .split("\n")
  .filter((o) => o)
  .filter((o) => !o.startsWith("#"));

rows2.forEach((o) => {
  const [codepoint, char, ts] = o.split("\t");

  const currentTs = strokeCounts1.get(codepoint);
  if (currentTs && currentTs !== ts) {
    console.warn(`${codepoint}: Expected stroke count ${ts}, got ${currentTs}`);
  }
  strokeCounts1.set(codepoint, ts);
});

fs.writeFileSync(
  "kIRGTotalStrokes.txt",
  Array.from(strokeCounts1, ([codepoint, ts]) => {
    return `${codepoint}\tkIRGTotalStrokes\t${ts}`;
  }).join("\n") + "\n"
);

// Generate diff
const existingTotalStrokes = new Map(
  fs
    .readFileSync("sources/Unihan_IRGSources.txt", "utf-8")
    .split("\n")
    .filter((o) => o && o.includes("kTotalStrokes"))
    .map((o) => {
      const [codepoint, tmp, strokes] = o.split("\t");
      return [codepoint, strokes];
    })
);

const diffRows = Array.from(strokeCounts1, ([codepoint, ts]) => {
  const existingTs = existingTotalStrokes.get(codepoint);
  if (existingTs !== ts) {
    return `${codepoint}\t${String.fromCodePoint(
      parseInt(codepoint.slice(2), 16)
    )}\t${existingTs}\t${ts}`;
  }
  return null;
}).filter((o) => o);

fs.writeFileSync(
  "kIRGTotalStrokesComparison.tsv",
  "codepoint\tchar\texisting value\tnew value\n" + diffRows.join("\n") + "\n"
);
