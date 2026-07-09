const GONGSI_MNEMONICS = [
  { part: "jijeok", code: "인떨어", concept: "신규등록·등록전환 때 분번을 붙이는 경우", clue: "인접한 경우, 멀리 떨어진 경우, 여러 필지인 경우", keywords: ["신규등록", "등록전환", "분번", "인접", "떨어"] },
  { part: "jijeok", code: "지축행", concept: "도시개발사업 시행지역의 지번부여방법 준용", clue: "지번변경, 축척변경, 행정구역 개편", keywords: ["도시개발사업", "지번부여", "지번변경", "축척변경", "행정구역"] },
  { part: "jijeok", code: "반지축", concept: "시·도지사 또는 대도시 시장 승인사항", clue: "지적공부 반출, 지번변경, 축척변경", keywords: ["승인", "지적공부 반출", "반출", "지번변경", "축척변경"] },
  { part: "jijeok", code: "임자모습황", concept: "지목이 임야인 토지", clue: "암석지, 자갈땅, 모래땅, 습지, 황무지", keywords: ["임야", "암석지", "자갈", "모래", "습지", "황무지"] },
  { part: "jijeok", code: "차장천원", concept: "지목 표기 때 차문자를 쓰는 경우", clue: "주차장, 공장용지, 하천, 유원지", keywords: ["주차장", "공장용지", "하천", "유원지", "차문자"] },
  { part: "jijeok", code: "도도공판", concept: "토지분할 때 건축물이 예외적으로 걸칠 수 있는 경우", clue: "도시·군관리계획선, 도시개발사업, 공공사업, 확정판결", keywords: ["토지분할", "건축물", "도시·군관리계획선", "도시개발사업", "공공사업", "확정판결"] },
  { part: "jijeok", code: "현경이 통과", concept: "성과검사 또는 면적측정을 하지 않는 측량", clue: "지적현황측량, 경계복원측량", keywords: ["성과검사", "면적측정", "지적현황측량", "경계복원측량"] },
  { part: "jijeok", code: "목도장", concept: "지목을 등록하는 지적공부", clue: "지적도, 임야도, 토지대장, 임야대장", keywords: ["지목", "지적공부", "지적도", "임야도", "토지대장", "임야대장"] },
  { part: "jijeok", code: "축도장", concept: "축척을 등록하는 지적공부", clue: "지적도, 임야도, 토지대장, 임야대장", keywords: ["축척", "지적도", "임야도", "토지대장", "임야대장"] },
  { part: "jijeok", code: "면장", concept: "면적을 등록하는 지적공부", clue: "토지대장, 임야대장", keywords: ["면적", "토지대장", "임야대장"] },
  { part: "jijeok", code: "경도", concept: "경계를 등록하는 지적공부", clue: "도면: 지적도, 임야도", keywords: ["경계", "지적도", "임야도"] },
  { part: "jijeok", code: "소대장", concept: "소유자 및 소유자 변경일·원인 등록", clue: "토지대장, 임야대장, 공유지연명부, 대지권등록부", keywords: ["소유자", "변경일", "변경원인", "토지대장", "임야대장", "공유지연명부", "대지권등록부"] },
  { part: "jijeok", code: "지대공", concept: "소유권 지분을 등록하는 지적공부", clue: "대지권등록부, 공유지연명부", keywords: ["소유권 지분", "지분", "대지권등록부", "공유지연명부"] },
  { part: "jijeok", code: "고장도 없다", concept: "고유번호·장번호는 지적도·임야도에 등록하지 않음", clue: "대장·공유지연명부·대지권등록부·경계점좌표등록부에는 등록", keywords: ["고유번호", "장번호", "지적도", "임야도", "경계점좌표등록부"] },
  { part: "jijeok", code: "도장경", concept: "도면번호를 등록하는 지적공부", clue: "토지대장, 임야대장, 경계점좌표등록부", keywords: ["도면번호", "토지대장", "임야대장", "경계점좌표등록부"] },
  { part: "jijeok", code: "개사장", concept: "개별공시지가와 토지이동사유 등록", clue: "토지대장, 임야대장", keywords: ["개별공시지가", "토지이동사유", "토지대장", "임야대장"] },
  { part: "jijeok", code: "공통1520", concept: "축척변경 절차 중 청산금 기간", clue: "청산금 공고 15일 이상, 청산금 통지 20일 이내", keywords: ["청산금", "15일", "20일", "축척변경"] },
  { part: "jijeok", code: "축복 현경이 바다 분할듣기 후 확정시자료 재검한다", concept: "지적측량 대상", clue: "축척변경, 복구, 지적현황, 경계복원, 등록말소, 분할, 등록전환, 기초, 확정, 정정, 신규등록, 재조사, 검사측량", keywords: ["지적측량", "축척변경", "복구", "지적현황", "경계복원", "등록말소", "분할", "등록전환", "검사측량"] },
  { part: "jijeok", code: "재검", concept: "측량의뢰 대상이 아닌 지적측량", clue: "지적재조사측량, 검사측량", keywords: ["측량의뢰", "지적재조사측량", "검사측량", "재조사"] },
  { part: "deunggi", code: "대접", concept: "대지권 관련 등기의 순위를 정하는 기준", clue: "등기의 순서는 접수번호 기준", keywords: ["대지권", "순위", "접수번호"] },
  { part: "deunggi", code: "대목토·대표·대뜻", concept: "대지권 3종 세트", clue: "목적토지 표시, 전유부분 표제부 대지권 표시, 토지 등기기록의 대지권 뜻 등기", keywords: ["대지권", "목적토지", "전유부분", "표제부", "뜻의 등기"] },
  { part: "deunggi", code: "경촉", concept: "경매 관련 등기 방식", clue: "경매개시결정등기, 경매로 인한 소유권이전등기는 촉탁", keywords: ["경매", "경매개시", "소유권이전", "촉탁"] },
  { part: "deunggi", code: "혼신", concept: "혼동으로 권리가 소멸하는 경우", clue: "단독신청으로 말소", keywords: ["혼동", "권리 소멸", "단독신청", "말소"] },
  { part: "deunggi", code: "필쏭의공", concept: "등기필정보를 제공하는 경우", clue: "승소한 등기의무자 단독신청, 공동신청·공동청구", keywords: ["등기필정보", "승소", "등기의무자", "공동신청", "공동청구"] },
  { part: "deunggi", code: "계소리", concept: "농지취득자격증명을 제공하는 경우", clue: "계약을 원인으로 소유권이전등기를 신청할 때", keywords: ["농지취득자격증명", "계약", "소유권이전등기"] },
  { part: "deunggi", code: "대표보이", concept: "대장 등 부동산 표시 증명정보 제공", clue: "표제부등기: 표시변경, 멸실, 소유권보존, 소유권이전", keywords: ["표제부", "표시변경", "멸실", "소유권보존", "소유권이전"] },
  { part: "deunggi", code: "전원보상", concept: "반드시 전원 명의로 실행해야 하는 등기", clue: "소유권보존등기, 상속등기", keywords: ["전원", "전원 명의", "소유권보존", "상속등기"] },
  { part: "deunggi", code: "지가우", concept: "자기 지분만으로 할 수 있는 등기", clue: "가등기권리자 1인 지분 본등기, 포괄유증 수증자 1인 지분 이전", keywords: ["자기 지분", "지분", "가등기권리자", "포괄유증", "수증자"] },
  { part: "deunggi", code: "보설이기추가", concept: "등기필정보를 작성하는 경우", clue: "보존등기, 설정등기, 이전등기, 가등기, 권리자 추가", keywords: ["등기필정보", "보존등기", "설정등기", "이전등기", "가등기", "권리자 추가"] },
  { part: "deunggi", code: "전이후경", concept: "협의분할에 의한 상속등기 방법", clue: "상속등기 전 협의분할은 이전등기, 상속등기 후 협의분할은 경정등기", keywords: ["협의분할", "상속등기", "이전등기", "경정등기"] },
  { part: "deunggi", code: "특미처", concept: "유증으로 인한 소유권이전등기 방법", clue: "미등기부동산은 특정유증인 경우만 상속인 명의 보존 후 수증자 명의 이전", keywords: ["유증", "특정유증", "미등기부동산", "수증자"] },
  { part: "deunggi", code: "전주일부", concept: "말소회복등기 방법", clue: "전부말소회복등기는 주등기, 일부말소회복등기는 부기등기", keywords: ["말소회복", "전부말소", "일부말소", "주등기", "부기등기"] },
  { part: "deunggi", code: "가가단", concept: "가등기 단독신청", clue: "가등기가처분명령에 의한 가등기는 가등기권리자가 단독신청", keywords: ["가등기", "가등기가처분명령", "단독신청"] },
  { part: "deunggi", code: "처가촉", concept: "처분금지가처분등기 실행방법", clue: "법원의 촉탁으로 실행", keywords: ["처분금지가처분", "가처분등기", "법원", "촉탁"] },
  { part: "deunggi", code: "그때 그 사람", concept: "가등기에 기한 본등기 때 등기의무자", clue: "본등기 당시 소유자가 아니라 가등기 당시 소유자", keywords: ["가등기", "본등기", "등기의무자", "당시 소유자"] },
  { part: "deunggi", code: "용용죽겠지", concept: "용익권설정가등기 후 본등기 때 직권말소 여부", clue: "본등기 시 용익권만 직권말소", keywords: ["용익권", "설정가등기", "본등기", "직권말소"] },
  { part: "deunggi", code: "저는 괜찮이유", concept: "저당권설정가등기 후 본등기 때 직권말소 여부", clue: "가등기 뒤의 등기는 말소되지 않음", keywords: ["저당권", "설정가등기", "직권말소", "말소되지"] },
  { part: "deunggi", code: "판단", concept: "가처분채권자가 승소한 경우 가처분등기 이후 마쳐진 등기", clue: "판결을 받아 단독신청으로 말소", keywords: ["가처분채권자", "승소", "판결", "단독신청", "말소"] }
];

function gongsiMnemonicEsc(value) {
  return String(value ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
}

function gongsiMnemonicPart() {
  if (location.pathname.includes("deunggi")) return "deunggi";
  if (location.pathname.includes("jijeok")) return "jijeok";
  return "";
}

function gongsiMnemonicMatches(text, part) {
  return GONGSI_MNEMONICS
    .filter(item => item.part === part)
    .map(item => ({
      item,
      score: item.keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 1 : 0), 0)
    }))
    .filter(row => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(row => row.item);
}

function gongsiMnemonicDetails(matches) {
  const rows = matches.map(item => `
    <div class="mnemonic-row">
      <b>${gongsiMnemonicEsc(item.code)}</b>
      <span>${gongsiMnemonicEsc(item.concept)}</span>
      <small>${gongsiMnemonicEsc(item.clue)}</small>
    </div>
  `).join("");
  return `<details class="mnemonic-hint"><summary>암기코드 펼쳐보기</summary>${rows}</details>`;
}

function decorateGongsiMnemonics() {
  const part = gongsiMnemonicPart();
  if (!part) return;
  document.querySelectorAll(".card, .memory-card").forEach(card => {
    if (card.querySelector(".mnemonic-hint")) return;
    const text = card.textContent || "";
    const matches = gongsiMnemonicMatches(text, part);
    if (!matches.length) return;
    const target = card.querySelector(".title") || card.querySelector(".memory-top") || card;
    target.insertAdjacentHTML("afterend", gongsiMnemonicDetails(matches));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.getElementById("cards");
  if (cards) {
    new MutationObserver(decorateGongsiMnemonics).observe(cards, { childList: true, subtree: true });
  }
  setTimeout(decorateGongsiMnemonics, 120);
});
