const DATA_KEYS = ["must", "study", "ox", "fill", "numbers", "cases"];
let DATASETS = Object.fromEntries(DATA_KEYS.map(key => [key, []]));
let STRUCTURE = [];

async function loadData() {
  const entries = await Promise.all(DATA_KEYS.map(async key => {
    const response = await fetch(`../data/minbeop/${key}.json?v=20260715-minbeop`);
    if (!response.ok) throw new Error(`${key} 자료를 불러오지 못했습니다.`);
    return [key, await response.json()];
  }));
  DATASETS = Object.fromEntries(entries);
}

function buildStructure() {
  const rows = Object.values(DATASETS).flat().filter(Boolean);
  const map = new Map();
  const largeOf = item => item.law || item.largeGroup || item.largeUnit || item.subject || "기타";
  const smallOf = item => item.smallUnit || item.unit || item.category || "공통";

  for (const item of rows) {
    const large = largeOf(item);
    const small = smallOf(item);
    if (!map.has(large)) map.set(large, new Map());
    map.get(large).set(small, (map.get(large).get(small) || 0) + 1);
  }

  STRUCTURE = Array.from(map.entries()).map(([name, childMap]) => ({
    name,
    count: Array.from(childMap.values()).reduce((sum, count) => sum + count, 0),
    children: Array.from(childMap.entries()).map(([childName, count]) => ({ name: childName, count }))
  }));
}

const LABELS = {
  must:"⭐ 반드시", study:"🃏 암기카드", years:"📅 년도별", ox:"OX", fill:"빈칸", numbers:"숫자", cases:"판례", all:"전체", wrong:"오답", fav:"별표"
};
const examDate = new Date("2026-10-31T00:00:00+09:00");
let currentTab = "must";
let selectedLarge = "";
let selectedSmall = "";
let search = "";
let allData = [];
const favs = new Set(JSON.parse(localStorage.getItem("minbeop_favs_excel_final") || "[]"));
const wrongs = new Set(JSON.parse(localStorage.getItem("minbeop_wrongs_excel_final") || "[]"));
let masterCounts = JSON.parse(localStorage.getItem("minbeop_master_counts_excel_final") || "{}");

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
}
function normalize(s) {
  return String(s ?? "")
    .replace(/정답|뒷면|앞면/g,"")
    .replace(/[①②③④⑤⑥⑦⑧⑨⑩]/g,"")
    .replace(/[\s,./;:|()\[\]{}·]/g,"")
    .toLowerCase();
}
function candidates(item) {
  const values = [item.answer, item.allowed].filter(Boolean);
  const blankCount = (String(item.question || "").match(/\(\s*\)/g) || []).length;
  const set = new Set();
  for (const value of values) {
    set.add(normalize(value));
    if (blankCount <= 1) {
      value.split(/[\n,;]| 또는 | 혹은 /).forEach(part => set.add(normalize(part)));
    }
  }
  return [...set].filter(Boolean);
}
function baseList() {
  if (currentTab === "all") return allData;
  if (currentTab === "fav") return allData.filter(x => favs.has(x.id));
  if (currentTab === "wrong") return allData.filter(x => wrongs.has(x.id));
  return DATASETS[currentTab] || [];
}
function match(item) {
  const text = [item.largeUnit,item.smallUnit,item.category,item.type,item.title,item.question,item.answer,item.allowed,item.explanation,item.memory,item.trap,...(item.tags||[])].join(" ").toLowerCase();
  if (selectedLarge && item.largeUnit !== selectedLarge) return false;
  if (selectedSmall && item.smallUnit !== selectedSmall) return false;
  if (search && !text.includes(search.toLowerCase())) return false;
  return true;
}
function setTab(tab) { currentTab = tab; render(); }
function selectUnit(large, small="") { selectedLarge = large || ""; selectedSmall = small || ""; render(); }
function clearUnit() { selectedLarge = ""; selectedSmall = ""; render(); }
function saveState() {
  localStorage.setItem("minbeop_favs_excel_final", JSON.stringify([...favs]));
  localStorage.setItem("minbeop_wrongs_excel_final", JSON.stringify([...wrongs]));
  localStorage.setItem("minbeop_master_counts_excel_final", JSON.stringify(masterCounts));
}
function renderTabs() {
  const tabs = ["must","study","years","ox","fill","numbers","cases","all","wrong","fav"]
    .filter(tab => tab !== "cases" || DATASETS.cases.length > 0);
  document.getElementById("tabs").innerHTML = tabs.map(t=>`<button class="${currentTab===t?'active':''}" onclick="setTab('${t}')">${LABELS[t]}</button>`).join("");
}

function masterCountForUnit(large, small="") {
  return allData
    .filter(x => x.largeUnit === large && (!small || x.smallUnit === small))
    .reduce((sum, x) => sum + ((Number(masterCounts[x.id]) || 0) > 0 ? 1 : 0), 0);
}
function markMastered(id) {
  if ((Number(masterCounts[id]) || 0) > 0) {
    delete masterCounts[id];
  } else {
    masterCounts[id] = 1;
  }
  saveState();
  renderFolders();
  renderCards();
}

function renderFolders() {
  const strip = document.getElementById("folderStrip");
  strip.innerHTML = `<button class="folder-chip ${!selectedLarge?'on':''}" onclick="clearUnit()">전체 단원</button>` +
    STRUCTURE.map(u=>`<button class="folder-chip ${selectedLarge===u.name&&!selectedSmall?'on':''}" onclick="selectUnit('${esc(u.name)}')">${esc(u.name)} · ${u.count}개 ㅡ 완전암기 ${masterCountForUnit(u.name)}/${u.count}</button>`).join("");
  document.getElementById("tree").innerHTML = STRUCTURE.map(u => `
    <div class="tree-section">
      <button class="tree-head ${selectedLarge===u.name&&!selectedSmall?'on':''}" onclick="selectUnit('${esc(u.name)}')">
        <span>${esc(u.name)}</span><span>${masterCountForUnit(u.name)}/${u.count}</span>
      </button>
      <div class="tree-child">
        ${(u.children||[]).map(c=>`<button class="${selectedSmall===c.name?'on':''}" onclick="selectUnit('${esc(u.name)}','${esc(c.name)}')">${esc(c.name)} · ${c.count}개 ㅡ 완전암기 ${masterCountForUnit(u.name, c.name)}/${c.count}</button>`).join("")}
      </div>
    </div>`).join("");
}
function quizBox(item) {
  if (!["ox","fill","numbers"].includes(currentTab)) return "";
  if (currentTab === "ox") {
    return `<div class="quiz-box">
      <div class="quiz-title">직접 풀기</div>
      <div class="quiz-actions">
        <button type="button" onclick="checkQuiz('${item.id}','O')">O</button>
        <button type="button" onclick="checkQuiz('${item.id}','X')">X</button>
      </div>
      <div id="result-${item.id}" class="quiz-result"></div>
    </div>`;
  }
  return `<div class="quiz-box">
    <div class="quiz-title">직접 풀기</div>
    <input id="answer-${item.id}" class="quiz-input" placeholder="정답 입력" onkeydown="if(event.key==='Enter') checkQuiz('${item.id}')" />
    <button class="quiz-check" type="button" onclick="checkQuiz('${item.id}')">채점</button>
    <div id="result-${item.id}" class="quiz-result"></div>
  </div>`;
}
function findItem(id) { return allData.find(x => x.id === id); }
function checkQuiz(id, val="") {
  const item = findItem(id);
  const result = document.getElementById(`result-${id}`);
  const input = document.getElementById(`answer-${id}`);
  const user = String(val || (input ? input.value : "")).trim();
  if (!user) {
    result.textContent = "정답을 입력하세요.";
    result.className = "quiz-result warn";
    return;
  }
  let ok = false;
  if (item.category === "OX" || item.type === "OX") {
    ok = normalize(user) === normalize(item.answer);
  } else {
    const n = normalize(user);
    ok = candidates(item).some(candidate => candidate === n);
  }
  if (ok) {
    result.textContent = "정답 ✅";
    result.className = "quiz-result correct";
  } else {
    result.textContent = "오답 ❌  정답: " + (item.allowed || item.answer);
    result.className = "quiz-result wrong";
    wrongs.add(id);
    saveState();
    renderStats();
  }
}

function visibleBlock(label, content, className="extra") {
  if (!content) return "";
  return `<div class="${className}"><strong>${label}</strong><br>${esc(content)}</div>`;
}
function studyRowsForTables() {
  const rows = [];
  const must = (DATASETS.must || []).filter(match);
  const nums = (DATASETS.numbers || []).filter(match);
  for (const item of must) {
    rows.push({...item, tableKind:"핵심정리", tableAnswer:item.answer || "", tableMemory:item.memory || "", tableTrap:item.trap || ""});
  }
  for (const item of nums) {
    rows.push({...item, tableKind:"숫자/세율", tableAnswer:item.answer || "", tableMemory:item.explanation || item.memory || "", tableTrap:item.trap || ""});
  }
  return rows;
}
function renderStudyTables() {
  const box = document.getElementById("cards");
  const rows = studyRowsForTables();

  if (!rows.length) {
    box.innerHTML = `<div class="empty">암기카드 데이터가 없습니다. 단원 선택이나 검색어를 초기화하세요.</div>`;
    return;
  }

  const groups = {};
  for (const item of rows) {
    const key = `${item.largeUnit}|||${item.smallUnit}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }

  box.innerHTML = Object.entries(groups).map(([key, items], idx) => {
    const [large, small] = key.split("|||");
    const cards = items.map((item, rowIdx) => {
      const done = (Number(masterCounts[item.id]) || 0) > 0;
      return `
        <article class="memory-card ${done ? "done" : ""}">
          <div class="memory-top">
            <span class="memory-no">${rowIdx + 1}</span>
            <div>
              <div class="memory-title">${esc(item.title)}</div>
              <div class="memory-meta">${esc(item.tableKind)} · ${esc(item.level || "")}</div>
            </div>
          </div>

          <div class="memory-section">
            <div class="memory-label">공부내용</div>
            <div class="memory-content">${esc(item.tableAnswer || "-")}</div>
          </div>

          ${item.tableMemory ? `
            <div class="memory-section point">
              <div class="memory-label">암기포인트</div>
              <div class="memory-content">${esc(item.tableMemory)}</div>
            </div>
          ` : ""}

          ${item.tableTrap ? `
            <div class="memory-section trap-card">
              <div class="memory-label">함정</div>
              <div class="memory-content">${esc(item.tableTrap)}</div>
            </div>
          ` : ""}

          <div class="memory-actions">
            <button class="small mastered ${done ? 'on' : ''}" onclick="markMastered('${item.id}')">${done ? '↺ 까먹음 처리' : '✓ 완전외움'}</button>
          </div>
        </article>
      `;
    }).join("");

    return `
      <details class="memory-unit" ${idx === 0 ? "open" : ""}>
        <summary>
          <span>${esc(large)} ㅡ ${esc(small)}</span>
          <b>${masterCountForUnit(large, small)}/${items.length}</b>
        </summary>
        <div class="memory-list">${cards}</div>
      </details>
    `;
  }).join("");
}
function renderVisibleStudyCard(item) {
  const isStudyContent = currentTab === "must" || currentTab === "study";
  return `
    <article class="card">
      <div class="badge-row">
        <span class="badge unit">${esc(item.largeUnit)}</span>
        <span class="badge unit">${esc(item.smallUnit)}</span>
        <span class="badge type">${esc(item.category)}</span>
        <span class="badge type">${esc(item.type || "")}</span>
        <span class="badge hot">${esc(item.level)}</span>
      </div>
      <div class="title">${esc(item.title)}</div>
      ${isStudyContent ? "" : `<div class="question">${esc(item.question)}</div>`}
      ${isStudyContent ? `<div class="answer visible-answer">${esc(item.answer || item.question || "")}${item.explanation ? "\n\n" + esc(item.explanation) : ""}</div>` : quizBox(item)}
      ${isStudyContent && item.memory ? visibleBlock("암기포인트", item.memory, "extra visible-note") : ""}
      ${isStudyContent && item.trap ? visibleBlock("함정", item.trap, "extra trap visible-note") : ""}
      ${!isStudyContent ? `<details><summary>${["ox","fill","numbers"].includes(currentTab) ? "정답/해설 보기" : "정답 보기"}</summary><div class="answer">${esc(item.answer)}${item.explanation ? "\n\n" + esc(item.explanation) : ""}</div></details>` : ""}
      ${!isStudyContent && item.memory ? `<details><summary>암기법 보기</summary><div class="extra">${esc(item.memory)}</div></details>` : ""}
      ${!isStudyContent && item.trap ? `<details><summary>함정 보기</summary><div class="extra trap">${esc(item.trap)}</div></details>` : ""}
      <div class="card-actions">
        <button class="small mastered ${(Number(masterCounts[item.id]) || 0) > 0 ? 'on' : ''}" onclick="markMastered('${item.id}')">${(Number(masterCounts[item.id]) || 0) > 0 ? '↺ 까먹음 처리' : '✓ 완전외움'}</button>
        <button class="small wrong ${wrongs.has(item.id)?'on':''}" onclick="toggleWrong('${item.id}')">✕ 오답</button>
        <button class="small fav ${favs.has(item.id)?'on':''}" onclick="toggleFav('${item.id}')">★ 별표</button>
      </div>
    </article>`;
}


function yearSourceRows() {
  const rows = [];
  const add = item => {
    const answer = item.answer || item.question || "";
    rows.push({
      ...item,
      tableKind: item.category || item.type || "암기",
      tableAnswer: answer,
      tableMemory: item.memory || item.explanation || "",
      tableTrap: item.trap || ""
    });
  };
  (DATASETS.must || []).forEach(add);
  (DATASETS.numbers || []).forEach(add);
  return rows;
}
function yearText(item) {
  return [item.title, item.question, item.answer, item.allowed, item.explanation, item.memory, item.trap, ...(item.tags || [])].join(" ");
}
function extractYearKeys(text) {
  const keys = new Set();
  const t = String(text || "");
  if (t.includes("매년")) keys.add("매년");
  const re = /(\d+)\s*년/g;
  let m;
  while ((m = re.exec(t)) !== null) {
    keys.add(`${Number(m[1])}년`);
  }
  return [...keys];
}
function yearSort(a, b) {
  if (a === "매년") return -1;
  if (b === "매년") return 1;
  const na = Number(String(a).replace(/[^0-9]/g, ""));
  const nb = Number(String(b).replace(/[^0-9]/g, ""));
  return na - nb || String(a).localeCompare(String(b), "ko");
}
function renderYearCards() {
  const box = document.getElementById("cards");
  const baseRows = yearSourceRows().filter(item => match(item) && extractYearKeys(yearText(item)).length);
  if (!baseRows.length) {
    box.innerHTML = `<div class="empty">년도별 암기 항목이 없습니다. 단원 선택이나 검색어를 초기화하세요.</div>`;
    return;
  }

  const groups = {};
  for (const item of baseRows) {
    for (const y of extractYearKeys(yearText(item))) {
      if (!groups[y]) groups[y] = [];
      if (!groups[y].some(x => x.id === item.id)) groups[y].push(item);
    }
  }

  box.innerHTML = Object.keys(groups).sort(yearSort).map((year, idx) => {
    const items = groups[year];
    const cards = items.map((item, rowIdx) => {
      const done = (Number(masterCounts[item.id]) || 0) > 0;
      return `
        <article class="memory-card ${done ? "done" : ""}">
          <div class="memory-top">
            <span class="memory-no">${rowIdx + 1}</span>
            <div>
              <div class="memory-title">${esc(item.title)}</div>
              <div class="memory-meta">${esc(item.largeUnit)} · ${esc(item.smallUnit)} · ${esc(item.tableKind)}</div>
            </div>
          </div>
          <div class="memory-section">
            <div class="memory-label">${esc(year)} 암기내용</div>
            <div class="memory-content">${esc(item.tableAnswer || "-")}</div>
          </div>
          ${item.tableMemory ? `
            <div class="memory-section point">
              <div class="memory-label">암기포인트</div>
              <div class="memory-content">${esc(item.tableMemory)}</div>
            </div>
          ` : ""}
          ${item.tableTrap ? `
            <div class="memory-section trap-card">
              <div class="memory-label">함정</div>
              <div class="memory-content">${esc(item.tableTrap)}</div>
            </div>
          ` : ""}
          <div class="memory-actions">
            <button class="small mastered ${done ? 'on' : ''}" onclick="markMastered('${item.id}')">${done ? '↺ 까먹음 처리' : '✓ 완전외움'}</button>
          </div>
        </article>
      `;
    }).join("");

    return `
      <details class="memory-unit" ${idx === 0 ? "open" : ""}>
        <summary><span>📅 ${esc(year)}</span><b>${items.length}개</b></summary>
        <div class="memory-list">${cards}</div>
      </details>
    `;
  }).join("");
}

function renderCards() {
  if (currentTab === "study") {
    renderStudyTables();
    return;
  }
  if (currentTab === "years") {
    renderYearCards();
    return;
  }
  const list = baseList().filter(match);
  const box = document.getElementById("cards");
  if (!list.length) {
    box.innerHTML = `<div class="empty">표시할 카드가 없습니다. 단원 선택 또는 검색어를 초기화하세요.</div>`;
    return;
  }
  box.innerHTML = list.map(item => renderVisibleStudyCard(item)).join("");
}
function toggleFav(id) { favs.has(id) ? favs.delete(id) : favs.add(id); saveState(); renderStats(); renderCards(); }
function toggleWrong(id) { wrongs.has(id) ? wrongs.delete(id) : wrongs.add(id); saveState(); renderStats(); renderCards(); }
function renderStats() {
  document.getElementById("mustCount").textContent = DATASETS.must.length;
  document.getElementById("quizCount").textContent = DATASETS.ox.length + DATASETS.fill.length + DATASETS.numbers.length;
  document.getElementById("wrongCount").textContent = wrongs.size;
  document.getElementById("favCount").textContent = favs.size;
}
function renderDday() {
  const diff = Math.ceil((examDate - new Date())/(1000*60*60*24));
  document.getElementById("dday").textContent = diff >= 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}
function render() {
  renderTabs();
  renderFolders();
  renderCards();
  renderStats();
  renderDday();
}
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadData();
    buildStructure();
  } catch (error) {
    document.getElementById("cards").innerHTML = `<div class="empty">민법 자료를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.</div>`;
    console.error(error);
    return;
  }
  allData = Object.entries(DATASETS).flatMap(([key, arr]) => (arr||[]).map(x => ({...x, dataGroup:key})));
  const memo = document.getElementById("memo");
  memo.value = localStorage.getItem("minbeop_memo_excel_final") || "";
  memo.addEventListener("input", () => localStorage.setItem("minbeop_memo_excel_final", memo.value));
  document.getElementById("searchInput").addEventListener("input", e => { search = e.target.value.trim(); renderCards(); });
  document.getElementById("resetBtn").addEventListener("click", () => { search=""; selectedLarge=""; selectedSmall=""; currentTab="must"; document.getElementById("searchInput").value=""; render(); });
  render();
});
