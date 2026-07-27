#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredExisting = [
  "app/page.tsx",
  "app/globals.css",
  "package.json",
  "public/workers/poetry-dataset-worker.js",
  "public/data/poems_with_more_info.tsv",
];
const requiredV7 = [
  "app/layout.tsx",
  "app/v7-shortcut.css",
  "app/research/layout.tsx",
  "app/research/page.tsx",
  "app/research/research.module.css",
  "app/research-data.json",
  "app/attribution-data.json",
  "public/downloads/public-questions-analysis.csv",
  "public/downloads/attribution-corpus-audit.csv",
];
const fail = (message) => { console.error(`V7 verification failed: ${message}`); process.exit(1); };
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

for (const file of [...requiredExisting, ...requiredV7]) {
  if (!fs.existsSync(path.join(root, file))) fail(`missing ${file}`);
}
const pkg = JSON.parse(read("package.json"));
if (!pkg.dependencies?.next || !pkg.dependencies?.react || !pkg.dependencies?.["lucide-react"]) {
  fail("the repository is not the expected Next.js project");
}
const questions = JSON.parse(read("app/research-data.json"));
const attribution = JSON.parse(read("app/attribution-data.json"));
if (!Array.isArray(questions.questions) || questions.questions.length !== 10) fail("research-data.json must contain exactly 10 questions");
if (!Array.isArray(attribution.cases) || attribution.cases.length !== 3) fail("attribution-data.json must contain three cases");
const layout = read("app/layout.tsx");
if (!layout.includes('import "./v7-shortcut.css";') || !layout.includes('href="/research"')) fail("layout does not expose the research route");
const page = read("app/research/page.tsx");
for (const forbidden of ["github.com/Hhhkarimi", "Persian-Literature-Digital-Atlas/blob", "raw.githubusercontent.com"]) {
  if (page.includes(forbidden)) fail(`public research page contains forbidden source reference: ${forbidden}`);
}
if (!page.includes('/downloads/public-questions-analysis.csv') || !page.includes('/downloads/attribution-corpus-audit.csv')) fail("download links are incomplete");
for (const file of ["public/downloads/public-questions-analysis.csv", "public/downloads/attribution-corpus-audit.csv"]) {
  const lines = read(file).split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) fail(`${file} has no data rows`);
}
console.log("V7 verification passed");
console.log(`Questions: ${questions.questions.length}`);
console.log(`Attribution cases: ${attribution.cases.length}`);
console.log("Route: /research");
