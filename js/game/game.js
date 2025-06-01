// 게임 로직

console.log("game.js loaded");

// 게임에서 사용할 전역 변수
window.game_mode = null; // 흑백 선택 여부
window.selectedTool = null; // 선택된 조리도구
window.selectedDifficulty = null; // 선택된 난이도

// Black/White selection logic
$(document).on("click", ".blackwhite-half.blackwhite-left", function () {
  console.log("clicked left");
  window.game_mode = "black";
  console.log("game_mode", window.game_mode);
  $("#black-white").hide();
  $("#tool-select").show();
});
$(document).on("click", ".blackwhite-half.blackwhite-right", function () {
  console.log("clicked right");
  window.game_mode = "white";
  console.log("game_mode", window.game_mode);
  $("#black-white").hide();
  $("#tool-select").show();
});

// When #game is shown, log game_mode, selectedTool, and selectedDifficulty
const observeGameDiv = () => {
  const gameDiv = document.getElementById("game");
  if (!gameDiv) return;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "style" && $(gameDiv).is(":visible")) {
        console.log("Game mode:", window.game_mode);
        console.log(
          "Selected tool:",
          window.selectedTool ? window.selectedTool : "(none selected)"
        );
        console.log("Selected difficulty:", window.selectedDifficulty);
      }
    });
  });
  observer.observe(gameDiv, { attributes: true, attributeFilter: ["style"] });
};

$(document).ready(function () {
  observeGameDiv();
});
