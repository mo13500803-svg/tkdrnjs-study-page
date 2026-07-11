import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import vm from "node:vm";

const root = resolve(import.meta.dirname, "..");
const sourceCommit = "1ddb50e";
const sourceFiles = [
  "data/deunggi/fill.json",
  "data/deunggi/ox.json",
  "data/deunggi/periods.json",
  "data/gongbeop/fill.json",
  "data/gongbeop/mcq.json",
  "data/gongbeop/mock.json",
  "data/gongbeop/numbers.json",
  "data/gongbeop/procedures.json",
  "data/hakgaeron/compare.json",
  "data/hakgaeron/fill.json",
  "data/hakgaeron/formula.json",
  "data/hakgaeron/formulaSummary.json",
  "data/hakgaeron/mcq.json",
  "data/hakgaeron/numbers.json",
  "data/jijeok/fill.json",
  "data/jijeok/ox.json",
  "data/jijeok/periods.json",
  "data/junggaesa/drills.json",
  "data/junggaesa/fill.json",
  "data/junggaesa/mcq.json",
  "data/junggaesa/mock.json",
  "data/junggaesa/numbers.json",
  "data/junggaesa/ox.json",
  "data/junggaesa/periods.json",
  "data/minbeop/cases.json",
  "data/minbeop/fill.json",
  "data/minbeop/numbers.json",
  "data/minbeop/ox.json",
  "data/sebeop/cases.json",
  "data/sebeop/fill.json",
  "data/sebeop/numbers.json",
  "data/sebeop/ox.json"
];

const subjectByFolder = {
  deunggi: "공시법",
  gongbeop: "부동산공법",
  hakgaeron: "부동산학개론",
  jijeok: "공시법",
  junggaesa: "중개사법령 및 중개실무",
  minbeop: "민법 및 민사특별법",
  sebeop: "세법"
};

const folderLabel = {
  deunggi: "등기법",
  gongbeop: "공법",
  hakgaeron: "학개론",
  jijeok: "지적법",
  junggaesa: "중개사법",
  minbeop: "민법",
  sebeop: "세법"
};

function gitShow(path) {
  return execFileSync("git", ["show", `${sourceCommit}:${path}`], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  });
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function comparisonKey(question, answer, choices = []) {
  return [question, answer, ...choices].map(clean).join("|").toLowerCase();
}

function normalizeAnswer(answer) {
  return clean(answer).replace(/[\s,·/]+/g, "").toLowerCase();
}

function normalizeItem(item, file, index) {
  const folder = file.split("/")[1];
  const subject = subjectByFolder[folder];
  const choices = Array.isArray(item.choices) ? item.choices.map(clean).filter(Boolean) : [];
  const rawAnswer = clean(item.answer ?? item.allowed);
  const allowed = clean(item.allowed ?? item.answer);
  const rawQuestion = clean(item.question || item.title);
  if (!subject || !rawQuestion) return null;

  let mode = "text";
  let answer = rawAnswer;
  let finalChoices = choices;

  if (choices.length >= 2) {
    mode = "choice";
    if (!/^\d+$/.test(answer)) {
      const matched = choices.findIndex(choice => normalizeAnswer(choice) === normalizeAnswer(answer));
      answer = matched >= 0 ? String(matched + 1) : answer;
    }
  } else if (/^[OX]$/i.test(rawAnswer)) {
    mode = "choice";
    finalChoices = ["O", "X"];
    answer = rawAnswer.toUpperCase() === "O" ? "1" : "2";
  } else if (!rawAnswer || normalizeAnswer(rawAnswer) === normalizeAnswer(rawQuestion)) {
    mode = "reveal";
    answer = rawAnswer || "원문에 정답이 따로 표시되지 않은 확인형 문제입니다.";
  }

  const large = clean(item.law || item.largeGroup || item.largeUnit);
  const small = clean(item.smallUnit || item.unit || item.category || item.type);
  const unitParts = [];
  if (folder === "deunggi" || folder === "jijeok") unitParts.push(folderLabel[folder]);
  if (large && large !== subject && !unitParts.includes(large)) unitParts.push(large);
  if (small && !unitParts.includes(small)) unitParts.push(small);

  return {
    id: `SUP-${folderLabel[folder]}-${String(index + 1).padStart(4, "0")}-${clean(item.id)}`,
    examId: "사용자추가자료",
    round: "자료",
    session: "추가자료",
    subject,
    unit: unitParts.join(" > ") || "추가자료",
    difficulty: clean(item.level) || "추가자료",
    type: clean(item.type || item.category) || "문답",
    mode,
    question: rawQuestion,
    choices: finalChoices,
    answer,
    allowed: mode === "text" ? allowed : "",
    explanation: clean(item.explanation || item.memory || item.trap),
    source: clean(item.source) || `사용자 제공자료 · ${file.split("/").at(-1)}`,
    originalId: clean(item.id)
  };
}

const mockQuestions = JSON.parse(readFileSync(resolve(root, "data/mock/questions.json"), "utf8"));
const seen = new Set(mockQuestions.map(item => comparisonKey(item.question, item.answer, item.choices)));
const supplemental = [];

for (const file of sourceFiles) {
  const items = JSON.parse(gitShow(file));
  items.forEach((item, index) => {
    const normalized = normalizeItem(item, file, index);
    if (!normalized) return;
    const key = comparisonKey(normalized.question, normalized.answer, normalized.choices);
    if (seen.has(key)) return;
    seen.add(key);
    supplemental.push(normalized);
  });
}

const photoScript = gitShow("assets/hakgaeron-photo-ox.js");
const photoItems = vm.runInNewContext(`${photoScript}\nHAKGAERON_PHOTO_OX`);
photoItems.forEach((item, index) => {
  const normalized = normalizeItem(item, "data/hakgaeron/photo-ox.json", index);
  if (!normalized) return;
  const key = comparisonKey(normalized.question, normalized.answer, normalized.choices);
  if (seen.has(key)) return;
  seen.add(key);
  supplemental.push(normalized);
});

const subjectCounts = {};
supplemental.forEach((item, index) => {
  subjectCounts[item.subject] = (subjectCounts[item.subject] || 0) + 1;
  item.subjectNo = subjectCounts[item.subject];
  item.globalNo = mockQuestions.length + index + 1;
});

const output = resolve(root, "data/practice/supplemental-questions.json");
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(supplemental)}\n`, "utf8");

console.log(JSON.stringify({ total: supplemental.length, subjects: subjectCounts }, null, 2));
