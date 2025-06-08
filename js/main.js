// 메인 스크립트 (화면 전환, 초기화)
$(document).ready(function () {
  const $mainScreen = $("#main");
  const $gameScreen = $("#game");
  const $startGameBtn = $("#start-game-btn");

  // 게임 시작 버튼
  $startGameBtn.on("click", function () {
    // 클릭 효과
    if (!window.particlesDisabled) {
      createTransitionEffect();
    }

    // 부드러운 페이드 아웃
    $mainScreen.fadeOut(500, function () {
      $("#black-white").fadeIn(500, function () {
        // 화면 변경 이벤트 발생
        $(document).trigger("screen-changed", ["black-white"]);
      });
    });
  });

  // 설정 시스템 초기화
  initSettingsSystem();

  // 뒤로가기 버튼 기능 (ESC 키)
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      handleBackNavigation();
    }
  });
});

// 화면 전환 효과
function createTransitionEffect() {
  // 화면 중앙에서 폭발하는 파티클 효과
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    const distance = 100 + Math.random() * 50;
    const particleX = centerX + Math.cos(angle) * distance;
    const particleY = centerY + Math.sin(angle) * distance;

    const $particle = $("<div></div>");
    $particle.css({
      position: "fixed",
      left: centerX + "px",
      top: centerY + "px",
      width: "8px",
      height: "8px",
      background: `linear-gradient(45deg, ${
        ["#ff6b35", "#f7931e", "#ffaa4d"][Math.floor(Math.random() * 3)]
      }, transparent)`,
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: 9999,
      boxShadow: "0 0 10px currentColor",
    });

    $("body").append($particle);

    $particle.animate(
      {
        left: particleX + "px",
        top: particleY + "px",
        opacity: 0,
        width: "2px",
        height: "2px",
      },
      800,
      function () {
        $(this).remove();
      }
    );
  }

  // 중앙에 큰 불꽃 효과
  const $centerExplosion = $("<div></div>");
  $centerExplosion.css({
    position: "fixed",
    left: centerX - 25 + "px",
    top: centerY - 25 + "px",
    width: "50px",
    height: "50px",
    background: "radial-gradient(circle, #ffff00, #ff6b35)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 9999,
    opacity: 0.8,
    boxShadow: "0 0 30px #ff6b35",
  });

  $("body").append($centerExplosion);

  $centerExplosion.animate(
    {
      width: "200px",
      height: "200px",
      left: centerX - 100 + "px",
      top: centerY - 100 + "px",
      opacity: 0,
    },
    600,
    function () {
      $(this).remove();
    }
  );
}

// 뒤로가기 처리
function handleBackNavigation() {
  const currentScreen = getCurrentScreen();

  switch (currentScreen) {
    case "black-white":
      // 흑백 선택화면에서 메인으로
      $("#black-white").fadeOut(300, function () {
        $("#main").fadeIn(300);
        $(document).trigger("screen-changed", ["main"]);
      });
      break;
    case "tool-select":
      // 도구 선택화면에서 흑백 선택으로
      $("#tool-select").fadeOut(300, function () {
        $("#black-white").fadeIn(300);
        $(document).trigger("screen-changed", ["black-white"]);
      });
      break;
    case "difficulty-select":
      // 난이도 선택화면에서 도구 선택으로
      $("#difficulty-select").fadeOut(300, function () {
        $("#tool-select").fadeIn(300);
        $(document).trigger("screen-changed", ["tool-select"]);
      });
      break;
  }
}

// 현재 화면 감지
function getCurrentScreen() {
  if ($("#main").is(":visible")) return "main";
  if ($("#black-white").is(":visible")) return "black-white";
  if ($("#tool-select").is(":visible")) return "tool-select";
  if ($("#difficulty-select").is(":visible")) return "difficulty-select";
  if ($("#game").is(":visible")) return "game";
  if ($("#success").is(":visible")) return "success";
  if ($("#failure").is(":visible")) return "failure";
  return "unknown";
}

// 전역 화면 전환 함수
window.switchToScreen = function (targetScreen, fadeTime = 500) {
  const currentScreen = getCurrentScreen();
  const $current = $(`#${currentScreen}`);
  const $target = $(`#${targetScreen}`);

  if (currentScreen !== targetScreen) {
    $current.fadeOut(fadeTime / 2, function () {
      $target.fadeIn(fadeTime / 2, function () {
        $(document).trigger("screen-changed", [targetScreen]);
      });
    });
  }
};

// 게임 데이터 관리
window.gameData = {
  selectedSide: null,
  selectedTool: null,
  selectedDifficulty: null,

  // 설정값들
  getSettings: function () {
    return {
      bgmVolume: typeof getBgmVolume === "function" ? getBgmVolume() : 0.5,
      sfxVolume: typeof getSfxVolume === "function" ? getSfxVolume() : 0.7,
      particlesEnabled: !window.particlesDisabled,
      animationsEnabled: !$("body").hasClass("no-animations"),
    };
  },
};
