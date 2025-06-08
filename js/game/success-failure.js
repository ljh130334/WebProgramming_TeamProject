$(document).ready(function () {
  initResultScreens();
  loadGameProgress();
});

// 게임 진행 상태 관리
let gameProgress = {
  unlockedStages: 1,
  unlockedTools: ["Wok", "Knife"],
  currentStage: 1,
  maxStage: 3,
};

function initResultScreens() {
  // 화면 전환 이벤트 리스너
  $(document).on("screen-changed", function (e, screenId) {
    if (screenId === "success") {
      handleSuccessScreen();
    } else if (screenId === "failure") {
      handleFailureScreen();
    }
  });
}

// ===========================================
// 게임 진행 상태 관리
// ===========================================

function loadGameProgress() {
  const saved = localStorage.getItem("gameProgress");
  if (saved) {
    gameProgress = { ...gameProgress, ...JSON.parse(saved) };
  }
  console.log("게임 진행 상태 로드:", gameProgress);
}

function saveGameProgress() {
  localStorage.setItem("gameProgress", JSON.stringify(gameProgress));
  console.log("게임 진행 상태 저장:", gameProgress);
}

function updateProgress(stageCleared) {
  // 단계 클리어시 진행 상태 업데이트
  if (stageCleared > gameProgress.unlockedStages) {
    gameProgress.unlockedStages = Math.min(
      stageCleared + 1,
      gameProgress.maxStage
    );

    // 도구 잠금 해제
    if (
      stageCleared === 1 &&
      !gameProgress.unlockedTools.includes("Gold Pan")
    ) {
      gameProgress.unlockedTools.push("Gold Pan");
      console.log("황금 팬 잠금 해제!");
    }
    if (
      stageCleared === 2 &&
      !gameProgress.unlockedTools.includes("Gold Turner")
    ) {
      gameProgress.unlockedTools.push("Gold Turner");
      console.log("황금 뒤집개 잠금 해제!");
    }

    saveGameProgress();
  }
}

// 도구 잠금 상태 확인 (tools.js에서 사용)
window.isToolUnlocked = function (toolName) {
  return gameProgress.unlockedTools.includes(toolName);
};

// 현재 진행 상태 반환
window.getGameProgress = function () {
  return gameProgress;
};

// ===========================================
// 성공 화면 처리
// ===========================================

function handleSuccessScreen() {
  const recipeName = sessionStorage.getItem("completedRecipe") || "요리";
  const recipeEmoji = sessionStorage.getItem("recipeEmoji") || "🍽️";
  const difficulty = sessionStorage.getItem("gameDifficulty") || "Easy";
  const currentStage = parseInt(sessionStorage.getItem("currentStage") || "1");

  const difficultyText = {
    Easy: "쉬움",
    Normal: "보통",
    Hard: "어려움",
  };

  // 진행 상태 업데이트
  updateProgress(currentStage);

  const isLastStage = currentStage >= gameProgress.maxStage;
  const nextStage = currentStage + 1;

  // 새로 해제된 도구 확인
  const newlyUnlockedTools = [];
  if (currentStage === 1 && gameProgress.unlockedTools.includes("Gold Pan")) {
    newlyUnlockedTools.push("황금 팬");
  }
  if (
    currentStage === 2 &&
    gameProgress.unlockedTools.includes("Gold Turner")
  ) {
    newlyUnlockedTools.push("황금 뒤집개");
  }

  // 성공 화면 HTML 동적 생성
  const successHtml = `
        <div class="result-container success-container">
          <!-- 배경 오버레이 -->
          <div class="result-overlay"></div>
          
          <!-- 중앙 컨텐츠 -->
          <div class="result-content">
            <div class="result-icon success-icon">
              <div class="icon-wrapper">
                ${recipeEmoji}
              </div>
            </div>
            
            <div class="result-title success-title">
              ${currentStage}단계 ${recipeName} 완성!
            </div>
            
            <div class="result-subtitle success-subtitle">
              ${difficultyText[difficulty]} 난이도를 클리어했습니다!
            </div>
            
            ${
              newlyUnlockedTools.length > 0
                ? `
            <div class="unlock-notification">
              🎉 새로운 도구 해제: ${newlyUnlockedTools.join(", ")}
            </div>
            `
                : ""
            }
            
            <div class="result-message">
              맛있어요. 진짜 맛있어요.
            </div>
            
            <div class="result-timer" id="success-timer">
              <span>${
                isLastStage
                  ? "15초 뒤 메인 화면으로 돌아갑니다"
                  : "15초 뒤 다음 단계로 이동합니다"
              }</span>
            </div>
            
            <div class="result-buttons">
              ${
                !isLastStage
                  ? `
              <button class="result-btn primary-btn" id="success-next-stage">
                🚀 ${nextStage}단계로
              </button>
              `
                  : ""
              }
              <button class="result-btn secondary-btn" id="success-tool-select">
                🔧 도구 다시 고르기
              </button>
              <button class="result-btn secondary-btn" id="success-replay">
                🔄 다시하기
              </button>
              <button class="result-btn tertiary-btn" id="success-home">
                🏠 메인으로
              </button>
            </div>
          </div>
        </div>
      `;

  $("#success").html(successHtml);

  // 타이머 시작
  let countdown = 15;
  const timer = setInterval(() => {
    countdown--;
    const action = isLastStage
      ? "메인 화면으로 돌아갑니다"
      : "다음 단계로 이동합니다";
    $("#success-timer span").text(`${countdown}초 뒤 ${action}`);

    if (countdown <= 0) {
      clearInterval(timer);
      if (isLastStage) {
        goToMain();
      } else {
        goToNextStage();
      }
    }
  }, 1000);

  // 성공 파티클 효과
  if (!window.particlesDisabled) {
    createSuccessParticles(recipeEmoji);
  }

  // 버튼 이벤트
  $("#success")
    .off("click")
    .on("click", function (e) {
      const target = e.target;

      if (target.id === "success-next-stage") {
        e.stopPropagation();
        clearInterval(timer);
        goToNextStage();
      } else if (target.id === "success-tool-select") {
        e.stopPropagation();
        clearInterval(timer);
        goToToolSelect();
      } else if (target.id === "success-replay") {
        e.stopPropagation();
        clearInterval(timer);
        goToGame();
      } else if (target.id === "success-home") {
        e.stopPropagation();
        clearInterval(timer);
        goToMain();
      } else if (
        target.id === "success" ||
        $(target).hasClass("result-container")
      ) {
        clearInterval(timer);
        if (isLastStage) {
          goToMain();
        } else {
          goToNextStage();
        }
      }
    });
}

// ===========================================
// 실패 화면 처리
// ===========================================

function handleFailureScreen() {
  const recipeName = sessionStorage.getItem("completedRecipe") || "요리";
  const recipeEmoji = sessionStorage.getItem("recipeEmoji") || "🍽️";
  const difficulty = sessionStorage.getItem("gameDifficulty") || "Easy";
  const currentStage = parseInt(sessionStorage.getItem("currentStage") || "1");

  const difficultyText = {
    Easy: "쉬움",
    Normal: "보통",
    Hard: "어려움",
  };

  // 실패 화면 HTML 동적 생성
  const failureHtml = `
        <div class="result-container failure-container">
          <!-- 배경 오버레이 -->
          <div class="result-overlay failure-overlay"></div>
          
          <!-- 중앙 컨텐츠 -->
          <div class="result-content">
            <div class="result-icon failure-icon">
              <div class="icon-wrapper">
                😰
              </div>
            </div>
            
            <div class="result-title failure-title">
              ${currentStage}단계 ${recipeName} 만들기 실패!
            </div>
            
            <div class="result-subtitle failure-subtitle">
              ${difficultyText[difficulty]} 난이도에 다시 도전해보세요!
            </div>
            
            <div class="result-message">
              이븐하지 않잖아요!
            </div>
            
            <div class="result-timer" id="failure-timer">
              <span>15초 뒤 다시 도전할 수 있습니다</span>
            </div>
            
            <div class="result-buttons">
              <button class="result-btn primary-btn" id="failure-retry">
                🔄 다시하기
              </button>
              <button class="result-btn secondary-btn" id="failure-tool-select">
                🔧 도구 다시 고르기
              </button>
              <button class="result-btn secondary-btn" id="failure-difficulty">
                ⚙️ 난이도 변경
              </button>
              <button class="result-btn tertiary-btn" id="failure-home">
                🏠 메인으로
              </button>
            </div>
          </div>
        </div>
      `;

  $("#failure").html(failureHtml);

  // 타이머 시작
  let countdown = 15;
  const timer = setInterval(() => {
    countdown--;
    $("#failure-timer span").text(`${countdown}초 뒤 다시 도전할 수 있습니다`);

    if (countdown <= 0) {
      clearInterval(timer);
      goToGame();
    }
  }, 1000);

  // 실패 파티클 효과
  if (!window.particlesDisabled) {
    createFailureParticles();
  }

  // 버튼 이벤트
  $("#failure")
    .off("click")
    .on("click", function (e) {
      const target = e.target;

      if (target.id === "failure-retry") {
        e.stopPropagation();
        clearInterval(timer);
        goToGame();
      } else if (target.id === "failure-tool-select") {
        e.stopPropagation();
        clearInterval(timer);
        goToToolSelect();
      } else if (target.id === "failure-difficulty") {
        e.stopPropagation();
        clearInterval(timer);
        goToDifficultySelect();
      } else if (target.id === "failure-home") {
        e.stopPropagation();
        clearInterval(timer);
        goToMain();
      } else if (
        target.id === "failure" ||
        $(target).hasClass("result-container")
      ) {
        clearInterval(timer);
        goToGame();
      }
    });
}

// ===========================================
// 네비게이션 함수
// ===========================================

function goToMain() {
  clearSessionData();
  if (typeof switchToScreen === "function") {
    switchToScreen("main", 500);
  }
}

function goToGame() {
  if (typeof switchToScreen === "function") {
    switchToScreen("game", 500);
  }
}

function goToNextStage() {
  const currentStage = parseInt(sessionStorage.getItem("currentStage") || "1");
  const nextStage = currentStage + 1;

  // 다음 단계 설정
  sessionStorage.setItem("currentStage", nextStage.toString());

  // 게임 화면으로 이동
  if (typeof switchToScreen === "function") {
    switchToScreen("game", 500);
  }
}

function goToToolSelect() {
  // 현재 단계 정보는 유지하고 도구 선택으로
  if (typeof switchToScreen === "function") {
    switchToScreen("tool-select", 500);
  }
}

function goToDifficultySelect() {
  if (typeof switchToScreen === "function") {
    switchToScreen("difficulty-select", 500);
  }
}

function clearSessionData() {
  sessionStorage.removeItem("completedRecipe");
  sessionStorage.removeItem("recipeEmoji");
  sessionStorage.removeItem("gameDifficulty");
  sessionStorage.removeItem("gameResult");
  sessionStorage.removeItem("currentStage");
}

// ===========================================
// 파티클 효과
// ===========================================

function createSuccessParticles(recipeEmoji) {
  const colors = ["#FFD700", "#FF6B35", "#4CAF50", "#FF9800"];
  const emojis = ["🎉", "✨", "🌟", "🎊", recipeEmoji];

  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const $particle = $(
        '<div class="result-particle success-particle"></div>'
      );

      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];

      $particle
        .css({
          position: "fixed",
          left: x + "px",
          top: y + "px",
          color: color,
          fontSize: "28px",
          zIndex: 1000,
          pointerEvents: "none",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        })
        .text(emoji);

      $("body").append($particle);

      $particle.animate(
        {
          top: y - 200 + "px",
          opacity: 0,
          fontSize: "36px",
        },
        4000,
        function () {
          $(this).remove();
        }
      );
    }, i * 150);
  }
}

function createFailureParticles() {
  const colors = ["#F44336", "#FF5722", "#795548"];
  const emojis = ["💥", "😢", "💔", "😵", "🌧️", "😰"];

  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const $particle = $(
        '<div class="result-particle failure-particle"></div>'
      );

      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];

      $particle
        .css({
          position: "fixed",
          left: x + "px",
          top: y + "px",
          color: color,
          fontSize: "24px",
          zIndex: 1000,
          pointerEvents: "none",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        })
        .text(emoji);

      $("body").append($particle);

      $particle.animate(
        {
          top: y + 150 + "px",
          opacity: 0,
          fontSize: "16px",
        },
        3000,
        function () {
          $(this).remove();
        }
      );
    }, i * 200);
  }
}
