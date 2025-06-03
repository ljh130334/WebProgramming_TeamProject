$(document).ready(function () {
  initDifficultyScreen();
});

function initDifficultyScreen() {
  // 화면 표시 시 초기화
  $(document).on("screen-changed", function (e, screenId) {
    if (screenId === "difficulty-select") {
      // 현재 단계 초기화 (새로 게임 시작할 때)
      if (!sessionStorage.getItem("currentStage")) {
        sessionStorage.setItem("currentStage", "1");
      }
      startDifficultyAnimations();
    }
  });

  // 난이도 선택 이벤트 (이벤트 위임 방식으로 수정 + 중복 방지)
  $(document)
    .off("click", ".difficulty-card")
    .on("click", ".difficulty-card", function (e) {
      e.stopPropagation();

      // 이미 선택 중인 경우 무시
      if ($(this).hasClass("selected") || $(this).hasClass("selecting")) {
        return;
      }

      const difficulty = $(this).data("difficulty");
      handleDifficultySelection($(this), difficulty);
    });

  // 호버 효과 (중복 방지)
  $(document)
    .off("mouseenter", ".difficulty-card")
    .on("mouseenter", ".difficulty-card", function () {
      // 선택 중이거나 선택된 카드는 호버 효과 무시
      if ($(this).hasClass("selected") || $(this).hasClass("selecting")) {
        return;
      }

      if (!window.particlesDisabled) {
        createDifficultyHoverEffect($(this));
      }
    });
}

// ===========================================
// 난이도 선택 처리
// ===========================================

function handleDifficultySelection($card, difficulty) {
  console.log("난이도 선택:", difficulty);

  // 이미 선택 과정 중이면 중단
  if (
    $card.hasClass("selected") ||
    $(".difficulty-card").hasClass("selecting")
  ) {
    return;
  }

  // 다른 카드들 비활성화
  $(".difficulty-card").not($card).addClass("selecting");

  // 선택된 카드 강조
  $card.addClass("selected");

  // 선택 파티클 효과
  if (!window.particlesDisabled) {
    createDifficultySelectionParticles($card);
  }

  // 효과음 재생
  if (typeof getSfxVolume === "function") {
    console.log("난이도 선택 효과음 재생 - 볼륨:", getSfxVolume());
  }

  // 선택 데이터 저장
  if (window.gameData) {
    window.gameData.selectedDifficulty = difficulty;
  }
  sessionStorage.setItem("selectedDifficulty", difficulty);

  // 성공 메시지 표시
  showDifficultyMessage(difficulty);

  // 게임 화면으로 전환 (2초 후)
  setTimeout(() => {
    // 상태 초기화 (다음 선택을 위해)
    resetDifficultySelection();

    if (typeof switchToScreen === "function") {
      switchToScreen("game", 500);
    }
  }, 2000);
}

// 난이도 선택 상태 초기화
function resetDifficultySelection() {
  $(".difficulty-card").removeClass("selected selecting");
  $(".difficulty-selection-message").remove();
}

// ===========================================
// 파티클 효과
// ===========================================

// 호버 파티클 효과
function createDifficultyHoverEffect($card) {
  const rect = $card[0].getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const $particle = $('<div class="difficulty-hover-particle"></div>');
      $particle.css({
        position: "fixed",
        left: centerX + (Math.random() - 0.5) * 80 + "px",
        top: centerY + (Math.random() - 0.5) * 80 + "px",
      });

      $("body").append($particle);

      setTimeout(() => {
        $particle.remove();
      }, 1500);
    }, i * 100);
  }
}

// 선택 시 파티클 효과
function createDifficultySelectionParticles($card) {
  const rect = $card[0].getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // 폭발 효과
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const distance = 50 + Math.random() * 60;
    const particleX = centerX + Math.cos(angle) * distance;
    const particleY = centerY + Math.sin(angle) * distance;

    const $particle = $('<div class="difficulty-selection-particle"></div>');
    $particle.css({
      position: "fixed",
      left: centerX + "px",
      top: centerY + "px",
      background: getDifficultyColor($card.data("difficulty")),
    });

    $("body").append($particle);

    setTimeout(() => {
      $particle.animate(
        {
          left: particleX + "px",
          top: particleY + "px",
          opacity: 0,
        },
        1000,
        function () {
          $(this).remove();
        }
      );
    }, 50);
  }
}

// ===========================================
// 유틸리티 함수들
// ===========================================

// 난이도별 색상 반환
function getDifficultyColor(difficulty) {
  const colors = {
    Easy: "#4CAF50",
    Normal: "#FF9800",
    Hard: "#F44336",
  };
  return colors[difficulty] || "#ff6b35";
}

// 난이도 선택 성공 메시지
function showDifficultyMessage(difficulty) {
  // 기존 메시지 제거
  $(".difficulty-selection-message").remove();

  const messages = {
    Easy: "쉬움 난이도를 선택했습니다! 🌟",
    Normal: "보통 난이도를 선택했습니다! ⚡",
    Hard: "어려움 난이도를 선택했습니다! 🔥",
  };

  const $message = $('<div class="difficulty-selection-message"></div>');
  $message.html(`
      <div class="selection-icon">✨</div>
      <div class="selection-text">${messages[difficulty]}</div>
      <div class="selection-subtext">게임을 시작합니다...</div>
    `);

  $("#difficulty-select").append($message);

  setTimeout(() => {
    $message.fadeOut(500, function () {
      $(this).remove();
    });
  }, 1500);
}

// 화면 애니메이션 시작
function startDifficultyAnimations() {
  // 화면 진입 시 상태 초기화
  resetDifficultySelection();

  // 카드들 순차 등장
  $(".difficulty-card").each(function (index) {
    $(this).css({
      animationDelay: index * 0.2 + "s",
    });
  });
}

// ===========================================
// CSS 애니메이션 추가
// ===========================================

$("<style>")
  .text(
    `
    .difficulty-hover-particle {
      width: 8px;
      height: 8px;
      background: radial-gradient(circle, #ff6b35, #f7931e);
      border-radius: 50%;
      pointer-events: none;
      z-index: 10;
      animation: difficultyHoverParticle 1.5s ease-out forwards;
    }
  
    @keyframes difficultyHoverParticle {
      0% {
        opacity: 1;
        transform: scale(0.5);
      }
      100% {
        opacity: 0;
        transform: scale(2) translateY(-30px);
      }
    }
  
    .difficulty-selection-particle {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10;
      box-shadow: 0 0 15px currentColor;
    }
  
    .difficulty-selection-message {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      padding: 30px;
      border-radius: 20px;
      text-align: center;
      z-index: 100;
      animation: messageAppear 0.5s ease-out;
    }
  
    @keyframes messageAppear {
      0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
      }
      100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }
  
    .difficulty-selection-message .selection-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
  
    .difficulty-selection-message .selection-text {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
  
    .difficulty-selection-message .selection-subtext {
      font-size: 16px;
      opacity: 0.8;
    }

    /* 선택 중/선택된 카드 스타일 */
    .difficulty-card.selecting {
      opacity: 0.5;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .difficulty-card.selected {
      transform: scale(1.1);
      pointer-events: none;
      transition: transform 0.3s ease;
    }
  `
  )
  .appendTo("head");

// ===========================================
// 화면 전환 이벤트 처리
// ===========================================

$(document).on("screen-changed", function (e, screenId) {
  if (screenId === "difficulty-select") {
    // 난이도 선택 화면 진입 효과
    setTimeout(() => {
      if (!window.particlesDisabled) {
        createDifficultyScreenEntrance();
      }
    }, 300);
  } else {
    // 난이도 선택 화면을 떠날 때 정리
    if (screenId !== "difficulty-select") {
      resetDifficultySelection();
      $(".difficulty-exclusive").remove();
    }
  }
});

// 난이도 선택 화면 진입 시 환영 효과
function createDifficultyScreenEntrance() {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  for (let i = 0; i < 15; i++) {
    const angle = (i / 15) * Math.PI * 2;
    const distance = 80 + Math.random() * 80;
    const particleX = centerX + Math.cos(angle) * distance;
    const particleY = centerY + Math.sin(angle) * distance;

    const $particle = $('<div class="difficulty-entrance-particle"></div>');
    $particle.css({
      position: "fixed",
      left: centerX + "px",
      top: centerY + "px",
      width: "8px",
      height: "8px",
      background: ["#4CAF50", "#FF9800", "#F44336"][
        Math.floor(Math.random() * 3)
      ],
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: 9999,
      boxShadow: "0 0 15px currentColor",
    });

    $("body").append($particle);

    $particle.animate(
      {
        left: particleX + "px",
        top: particleY + "px",
        opacity: 0,
        width: "4px",
        height: "4px",
      },
      1200,
      function () {
        $(this).remove();
      }
    );
  }
}
