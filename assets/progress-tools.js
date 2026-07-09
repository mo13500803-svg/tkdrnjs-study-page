const PROGRESS_PREFIX = "realtor_progress_v1_";
const MOCK_PREFIX = "realtor_mock_v1_";

function progressToday() {
  return new Date().toISOString().slice(0, 10);
}

function progressKey(id) {
  return PROGRESS_PREFIX + id;
}

function readProgress(id) {
  try {
    return JSON.parse(localStorage.getItem(progressKey(id)) || "null") || {};
  } catch (e) {
    return {};
  }
}

function writeProgress(id, data) {
  localStorage.setItem(progressKey(id), JSON.stringify(data));
}

function questionById(id) {
  return QUESTIONS.find(q => q.id === id);
}

function answerFor(id, practiceMode) {
  if (practiceMode) return localStorage.getItem(MOCK_PREFIX + "answer_practice_" + id) || "";
  return localStorage.getItem(MOCK_PREFIX + "answer_" + id) || "";
}

function setStudyState(id, state) {
  const data = readProgress(id);
  data.state = state;
  data.updatedAt = progressToday();
  if (state === "mastered") data.unresolved = false;
  writeProgress(id, data);
  renderProgressTools();
  decorateQuestionCards();
}

function recordAttempt(q, user, source) {
  if (!q || !user) return;
  const ok = user === q.answer;
  const today = progressToday();
  const data = readProgress(q.id);
  data.id = q.id;
  data.subject = q.subject || "";
  data.unit = q.unit || "";
  data.question = q.question || "";
  data.answer = q.answer || "";
  data.source = source || "";
  data.attempts = (data.attempts || 0) + 1;
  data.lastAttemptDate = today;
  data.lastUser = user;
  if (ok) {
    data.correctCount = (data.correctCount || 0) + 1;
    data.unresolved = false;
  } else {
    data.wrongCount = (data.wrongCount || 0) + 1;
    data.lastWrongDate = today;
    data.todayWrongDate = today;
    data.unresolved = true;
  }
  if (!data.state) data.state = ok ? "new" : "review";
  writeProgress(q.id, data);
}

function allProgress() {
  const rows = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(PROGRESS_PREFIX)) continue;
    try {
      const row = JSON.parse(localStorage.getItem(key));
      if (row && row.id) rows.push(row);
    } catch (e) {}
  }
  return rows;
}

function currentMode() {
  return location.pathname.includes("practice.html") ? "practice" : "mock";
}

function currentQuestionsForPage() {
  if (currentMode() === "practice") {
    try { return Array.isArray(currentList) ? currentList : []; } catch (e) { return []; }
  }
  try {
    return QUESTIONS.filter(q => q.round == selectedRound && q.session === selectedSession);
  } catch (e) {
    return [];
  }
}

function recordCurrentSubmittedSet() {
  const practiceMode = currentMode() === "practice";
  currentQuestionsForPage().forEach(q => recordAttempt(q, answerFor(q.id, practiceMode), practiceMode ? "문제은행" : "모의고사"));
  renderProgressTools();
  decorateQuestionCards();
}

function percentText(correct, total) {
  if (!total) return "0%";
  return Math.round((correct / total) * 100) + "%";
}

function scoreSubjectName(subject) {
  const name = subject || "미분류";
  if (name.includes("공시") || name.includes("세법")) return "공시세법";
  if (name.includes("학개론")) return "학개론";
  if (name.includes("민법")) return "민법";
  if (name.includes("중개사")) return "중개사법";
  if (name.includes("공법")) return "공법";
  return name;
}

function subjectScoreRows(list, practiceMode) {
  const stats = {};
  list.forEach(q => {
    const name = scoreSubjectName(q.subject);
    const user = answerFor(q.id, practiceMode);
    if (!stats[name]) stats[name] = { total: 0, correct: 0, answered: 0 };
    stats[name].total += 1;
    if (user) stats[name].answered += 1;
    if (user && user === q.answer) stats[name].correct += 1;
  });
  return Object.entries(stats).sort().map(([name, s]) => {
    const score = s.total ? Math.round((s.correct / s.total) * 1000) / 10 : 0;
    const danger = score < 40 ? "과락위험" : "통과권";
    const badge = score < 40 ? "fail" : "pass";
    return `<tr><td>${esc(name)}</td><td>${s.correct}/${s.total}</td><td>${score}점</td><td>${percentText(s.answered, s.total)}</td><td><span class="badge ${badge}">${danger}</span></td></tr>`;
  }).join("");
}

function weakRankRows(rows) {
  const map = {};
  rows.forEach(r => {
    if (!r.wrongCount) return;
    const key = (r.subject || "미분류") + " > " + (r.unit || "미분류");
    if (!map[key]) map[key] = { subject: r.subject || "미분류", unit: r.unit || "미분류", wrong: 0, unresolved: 0 };
    map[key].wrong += r.wrongCount || 0;
    if (r.unresolved && r.state !== "mastered") map[key].unresolved += 1;
  });
  const ranked = Object.values(map).sort((a, b) => b.wrong - a.wrong || b.unresolved - a.unresolved).slice(0, 10);
  return ranked.map((r, idx) => `<tr><td>${idx + 1}</td><td>${esc(r.subject)}</td><td>${esc(r.unit)}</td><td>${r.wrong}</td><td>${r.unresolved}</td></tr>`).join("") || `<tr><td colspan="5">아직 누적 오답이 없습니다.</td></tr>`;
}

function wrongListCards(rows) {
  const today = progressToday();
  const todayRows = rows.filter(r => r.lastWrongDate === today);
  const twoPlus = rows.filter(r => (r.wrongCount || 0) >= 2);
  const remaining = rows.filter(r => r.unresolved && r.state !== "mastered");
  const block = (title, list) => `
    <div class="panel wrong-box">
      <strong>${title} <span class="badge type">${list.length}</span></strong>
      <div class="wrong-list">
        ${list.slice(0, 8).map(r => `
          <button type="button" class="wrong-item" onclick="jumpToQuestion('${r.id}')">
            <b>${esc(r.subject || "미분류")} / ${esc(r.unit || "미분류")}</b>
            <span>${esc(r.question || "")}</span>
          </button>
        `).join("") || `<div class="muted">없음</div>`}
      </div>
    </div>`;
  return `<div class="analysis-grid">${block("오늘 틀림", todayRows)}${block("2회 이상 틀림", twoPlus)}${block("마지막까지 남은 오답", remaining)}</div>`;
}

function jumpToQuestion(id) {
  const card = document.querySelector(`[data-question-id="${CSS.escape(id)}"]`);
  if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
}

function ensureProgressPanel() {
  let panel = document.getElementById("progressTools");
  if (panel) return panel;
  panel = document.createElement("section");
  panel.id = "progressTools";
  panel.className = "progress-tools";
  const anchor = document.getElementById(currentMode() === "practice" ? "practiceAnalysis" : "analysis");
  if (anchor) anchor.insertAdjacentElement("afterend", panel);
  return panel;
}

function renderProgressTools() {
  const panel = ensureProgressPanel();
  if (!panel) return;
  const rows = allProgress();
  const list = currentQuestionsForPage();
  const practiceMode = currentMode() === "practice";
  panel.innerHTML = `
    <div class="panel">
      <div class="progress-head">
        <strong>합격 관리판</strong>
        ${practiceMode ? `<label class="toggle-line"><input type="checkbox" id="hideMasteredToggle"> 완전암기 제외</label>` : ""}
      </div>
      <div class="sub">오답은 제출/채점할 때 자동 누적됩니다. 정답으로 다시 맞히면 마지막 오답에서 빠지고, 완전암기로 표시하면 복습 목록에서 제외됩니다.</div>
    </div>
    <div class="analysis-grid">
      <div class="panel">
        <strong>과목별 점수표</strong>
        <div class="table-wrap"><table><thead><tr><th>과목</th><th>정답</th><th>환산점수</th><th>응답률</th><th>과락</th></tr></thead><tbody>${subjectScoreRows(list, practiceMode)}</tbody></table></div>
      </div>
      <div class="panel">
        <strong>약점 단원 랭킹</strong>
        <div class="table-wrap"><table><thead><tr><th>#</th><th>과목</th><th>단원</th><th>누적오답</th><th>남은오답</th></tr></thead><tbody>${weakRankRows(rows)}</tbody></table></div>
      </div>
    </div>
    ${wrongListCards(rows)}
  `;
  const toggle = document.getElementById("hideMasteredToggle");
  if (toggle) {
    toggle.checked = document.body.classList.contains("hide-mastered");
    toggle.addEventListener("change", () => {
      document.body.classList.toggle("hide-mastered", toggle.checked);
      decorateQuestionCards();
    });
  }
}

function decorateQuestionCards() {
  const practiceMode = currentMode() === "practice";
  document.querySelectorAll(".question-card").forEach(card => {
    const input = card.querySelector("input[type='radio']");
    if (!input) return;
    const rawName = input.getAttribute("name") || "";
    const id = rawName.startsWith("p_") ? rawName.slice(2) : rawName;
    card.dataset.questionId = id;
    const state = readProgress(id).state || "new";
    card.classList.toggle("is-mastered", state === "mastered");
    card.classList.toggle("is-review", state === "review");
    let tools = card.querySelector(".study-state-tools");
    if (!tools) {
      tools = document.createElement("div");
      tools.className = "study-state-tools";
      const badgeRow = card.querySelector(".badge-row");
      if (badgeRow) badgeRow.insertAdjacentElement("afterend", tools);
    }
    tools.innerHTML = `
      <button type="button" class="${state === "new" ? "on" : ""}" onclick="setStudyState('${id}', 'new')">처음 봄</button>
      <button type="button" class="${state === "review" ? "on" : ""}" onclick="setStudyState('${id}', 'review')">다시 볼 것</button>
      <button type="button" class="${state === "mastered" ? "on" : ""}" onclick="setStudyState('${id}', 'mastered')">완전암기</button>
    `;
  });
}

function wireProgressTools() {
  const submitId = currentMode() === "practice" ? "submitPracticeBtn" : "submitBtn";
  const submit = document.getElementById(submitId);
  if (submit) submit.addEventListener("click", () => setTimeout(recordCurrentSubmittedSet, 50));
  document.querySelectorAll(".mobile-bottom-nav button").forEach(btn => {
    if ((btn.textContent || "").includes("채점")) {
      btn.addEventListener("click", () => setTimeout(recordCurrentSubmittedSet, 80));
    }
  });
  document.addEventListener("change", e => {
    if (e.target && e.target.matches("input[type='radio']")) setTimeout(() => {
      renderProgressTools();
      decorateQuestionCards();
    }, 20);
  });
  const target = document.getElementById(currentMode() === "practice" ? "practiceQuestions" : "examQuestions");
  if (target) {
    new MutationObserver(() => decorateQuestionCards()).observe(target, { childList: true, subtree: true });
  }
  setTimeout(() => {
    renderProgressTools();
    decorateQuestionCards();
  }, 80);
}

document.addEventListener("DOMContentLoaded", wireProgressTools);
