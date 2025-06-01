// 메인 스크립트 (화면 전환, 초기화)
$(document).ready(function () {
  const $mainScreen = $("#main");
  const $gameScreen = $("#game");
  const $startGameBtn = $("#start-game-btn");

  // 게임 시작 버튼
  $startGameBtn.on("click", function () {
    $mainScreen.hide();
    $("#black-white").show();
  });

  // 설정 시스템 초기화
  initSettingsSystem();
});
