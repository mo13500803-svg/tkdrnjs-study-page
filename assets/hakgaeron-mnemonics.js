const HAKGAERON_MNEMONICS = [
  {
    code: "건·건·선·항",
    concept: "원가법으로 평가",
    clue: "건물, 건설기계, 선박, 항공기",
    keywords: ["원가법", "건물", "건설기계", "선박", "항공기"]
  },
  {
    code: "동·산·과·자",
    concept: "거래사례비교법으로 평가",
    clue: "동산, 산림, 과수원, 자동차",
    keywords: ["거래사례비교법", "동산", "산림", "과수원", "자동차"]
  },
  {
    code: "영·어·광·~권",
    concept: "수익환원법으로 평가",
    clue: "영업권, 어업권, 광업재단, 그 밖의 수익권 성격 물건",
    keywords: ["수익환원법", "영업권", "어업권", "광업재단", "권"]
  },
  {
    code: "토지",
    concept: "공시지가기준법으로 평가",
    clue: "토지는 공시지가기준법을 기본으로 연결",
    keywords: ["공시지가기준법", "토지", "공시지가"]
  },
  {
    code: "임대료",
    concept: "임대사례비교법으로 평가",
    clue: "임대료 평가는 임대사례비교법",
    keywords: ["임대사례비교법", "임대료", "임대사례"]
  },
  {
    code: "산지+입목 일괄",
    concept: "거래사례비교법으로 평가",
    clue: "산지와 입목을 일괄하여 감정평가하는 경우",
    keywords: ["산지", "입목", "일괄", "거래사례비교법"]
  },
  {
    code: "입목",
    concept: "거래사례비교법으로 평가",
    clue: "입목 단독 평가도 거래사례비교법으로 연결",
    keywords: ["입목", "거래사례비교법"]
  },
  {
    code: "소경목림",
    concept: "원가법으로 평가",
    clue: "지름이 작은 나무·숲은 원가법",
    keywords: ["소경목림", "지름", "작은 나무", "숲", "원가법"]
  },
  {
    code: "기업가치",
    concept: "수익환원법으로 평가",
    clue: "기업가치는 수익성을 환원해서 본다",
    keywords: ["기업가치", "수익환원법"]
  }
];

function hakMnemonicEsc(value) {
  return String(value ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
}

function hakMnemonicMatches(text) {
  const isAppraisal = ["감정평가", "원가법", "거래사례비교법", "수익환원법", "공시지가기준법", "임대사례비교법"].some(keyword => text.includes(keyword));
  if (!isAppraisal) return [];
  return HAKGAERON_MNEMONICS
    .map(item => ({
      item,
      score: item.keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 1 : 0), 0)
    }))
    .filter(row => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(row => row.item);
}

function hakMnemonicDetails(matches) {
  const rows = matches.map(item => `
    <div class="mnemonic-row">
      <b>${hakMnemonicEsc(item.code)}</b>
      <span>${hakMnemonicEsc(item.concept)}</span>
      <small>${hakMnemonicEsc(item.clue)}</small>
    </div>
  `).join("");
  return `<details class="mnemonic-hint"><summary>암기코드 펼쳐보기</summary>${rows}</details>`;
}

function decorateHakMnemonics() {
  document.querySelectorAll(".card, .memory-card, .formula-card").forEach(card => {
    if (card.querySelector(".mnemonic-hint")) return;
    const matches = hakMnemonicMatches(card.textContent || "");
    if (!matches.length) return;
    const target = card.querySelector(".title") || card.querySelector(".memory-top") || card;
    target.insertAdjacentHTML("afterend", hakMnemonicDetails(matches));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.getElementById("cards");
  if (cards) {
    new MutationObserver(decorateHakMnemonics).observe(cards, { childList: true, subtree: true });
  }
  setTimeout(decorateHakMnemonics, 120);
});
