import fs from "fs";

const rows = fs
  .readFileSync("data/totalstrokes.txt", "utf-8")
  .split("\r\n")
  .filter((o) => o)
  .filter((o) => {
    const [codepoint] = o.split(" ");
    return parseInt(codepoint.slice(2), 16) >= 0x3400;
  });

fs.writeFileSync(
  "kIRGTotalStrokes.txt",
  rows
    .map((o) => {
      const [codepoint, tsfs] = o.split(" ");
      const [ts] = tsfs.split("|");
      return `${codepoint}\tkIRGTotalStrokes\t${ts}`;
    })
    .join("\n")
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

const diffRows = rows
  .map((o) => {
    const [codepoint, tsfs] = o.split(" ");
    const [ts, fs] = tsfs.split("|");
    const existingTs = existingTotalStrokes.get(codepoint);
    if (existingTs !== ts) {
      return `${codepoint}\t${String.fromCodePoint(
        parseInt(codepoint.slice(2), 16)
      )}\t${existingTs}\t${ts}`;
    }
    return null;
  })
  .filter((o) => o);

fs.writeFileSync(
  "kIRGTotalStrokesComparison.tsv",
  "codepoint\tchar\texisting value\tnew value\n" + diffRows.join("\n")
);
