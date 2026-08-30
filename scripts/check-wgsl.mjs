/**
 * Backticks inside a WGSL template literal end the literal, and the error you
 * get is a TypeScript parse failure forty lines away from the comment that
 * caused it. It has happened twice. This finds it in one line.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = "lib";
let bad = 0;
for (const f of readdirSync(dir)) {
  if (!f.endsWith(".wgsl.ts")) continue;
  const src = readFileSync(join(dir, f), "utf8");
  const open = src.indexOf("/* wgsl */ `");
  if (open === -1) continue;
  const body = src.slice(open + 12, src.lastIndexOf("`"));
  const lines = body.split("\n");
  lines.forEach((line, i) => {
    if (line.includes("`")) {
      console.error(`${dir}/${f}:${i + 1}: backtick inside the WGSL literal — ${line.trim()}`);
      bad++;
    }
  });
}
process.exit(bad ? 1 : 0);
