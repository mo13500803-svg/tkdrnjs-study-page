import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data", "minbeop");
const minimumCounts = { must: 32, study: 22, ox: 252, fill: 228, numbers: 27 };
const requiredFields = ["id", "largeUnit", "smallUnit", "title", "question", "answer"];
const badFragments = [
  "\uAC8C\uAC8C",
  "\uB54C\uB85C\uBD80\uD130\uD6A8\uB825",
  "\uB3C4\uB2EC \uD55C",
  "\uBAA8\uB450 \uAC00\uB2A5\uB97C",
  "\uB300\uD56D\uB825\uB97C",
  "\uAC31\uC2E0\uC694\uAD6C\uAD8C\uB294"
];
const ids = new Set();
const errors = [];
let total = 0;

for (const [name, minimum] of Object.entries(minimumCounts)) {
  const file = path.join(dataDir, `${name}.json`);
  const rows = JSON.parse(fs.readFileSync(file, "utf8"));

  if (!Array.isArray(rows)) errors.push(`${name}.json is not an array`);
  if (rows.length < minimum) errors.push(`${name}.json lost items: ${rows.length} < ${minimum}`);

  for (const [index, item] of rows.entries()) {
    total += 1;
    const label = item.id || `${name}[${index}]`;

    for (const field of requiredFields) {
      if (!String(item[field] ?? "").trim()) errors.push(`${label} missing ${field}`);
    }

    if (ids.has(item.id)) errors.push(`${label} has a duplicate id`);
    ids.add(item.id);

    const text = JSON.stringify(item);
    if (text.includes("\uFFFD")) errors.push(`${label} contains a replacement character`);
    if (/[\u2e80-\u9fff]/u.test(text)) errors.push(`${label} contains an OCR diagram fragment`);
    if (badFragments.some(fragment => text.includes(fragment))) errors.push(`${label} contains a known typo`);
    if (/[\uac00-\ud7a3]{20,}/u.test(item.question || "")) errors.push(`${label} contains collapsed spacing`);
    if (name === "ox" && !["O", "X"].includes(item.answer)) errors.push(`${label} has an invalid OX answer`);
    if (name === "fill" && !(item.question || "").includes("(")) errors.push(`${label} has no visible blank`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Minbeop audit passed: ${total} items, ${ids.size} unique ids.`);
