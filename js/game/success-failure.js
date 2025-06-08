$(document).ready(function () {
  initResultScreens();
  loadGameProgress();
});

let gameProgress = {
  unlockedStages: 1,
  unlockedTools: ["Wok", "Knife"],
  currentStage: 1,
  maxStage: 3,
};

function initResultScreens() {
  $(document).on("screen-changed", function (e, screenId) {
    if (screenId === "success") {
      handleSuccessScreen();
    } else if (screenId === "failure") {
      handleFailureScreen();
    }
  });
}

function loadGameProgress() {
  const saved = localStorage.getItem("gameProgress");
  if (saved) {
    gameProgress = { ...gameProgress, ...JSON.parse(saved) };
  }
}

function saveGameProgress() {
  localStorage.setItem("gameProgress", JSON.stringify(gameProgress));
}

function updateProgress(stageCleared) {
  if (stageCleared > gameProgress.unlockedStages) {
    gameProgress.unlockedStages = Math.min(
      stageCleared + 1,
      gameProgress.maxStage
    );

    if (
      stageCleared === 1 &&
      !gameProgress.unlockedTools.includes("Gold Pan")
    ) {
      gameProgress.unlockedTools.push("Gold Pan");
    }
    if (
      stageCleared === 2 &&
      !gameProgress.unlockedTools.includes("Gold Turner")
    ) {
      gameProgress.unlockedTools.push("Gold Turner");
    }

    saveGameProgress();
  }
}

window.isToolUnlocked = function (toolName) {
  return gameProgress.unlockedTools.includes(toolName);
};

window.getGameProgress = function () {
  return gameProgress;
};

function handleSuccessScreen() {
  const recipeName = localStorage.getItem("completedRecipe") || "요리";
  const recipeEmoji = localStorage.getItem("recipeEmoji") || "🍽️";
  const difficulty = localStorage.getItem("gameDifficulty") || "Easy";
  const currentStage = parseInt(localStorage.getItem("currentStage") || "1");

  const difficultyText = {
    Easy: "쉬움",
    Normal: "보통",
    Hard: "어려움",
  };

  updateProgress(currentStage);

  const isLastStage = currentStage >= gameProgress.maxStage;
  const nextStage = currentStage + 1;

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

  const successHtml = `
          <div class="result-container success-container">
            <div class="result-overlay"></div>
            
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

  if (!window.particlesDisabled) {
    createSuccessParticles(recipeEmoji);
  }

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

function handleFailureScreen() {
  const recipeName = localStorage.getItem("completedRecipe") || "요리";
  const recipeEmoji = localStorage.getItem("recipeEmoji") || "🍽️";
  const difficulty = localStorage.getItem("gameDifficulty") || "Easy";
  const currentStage = parseInt(localStorage.getItem("currentStage") || "1");

  const difficultyText = {
    Easy: "쉬움",
    Normal: "보통",
    Hard: "어려움",
  };

  const failureHtml = `
          <div class="result-container failure-container">
            <div class="result-overlay failure-overlay"></div>
            
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

  let countdown = 15;
  const timer = setInterval(() => {
    countdown--;
    $("#failure-timer span").text(`${countdown}초 뒤 다시 도전할 수 있습니다`);

    if (countdown <= 0) {
      clearInterval(timer);
      goToGame();
    }
  }, 1000);

  if (!window.particlesDisabled) {
    createFailureParticles();
  }

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
  const currentStage = parseInt(localStorage.getItem("currentStage") || "1");
  const nextStage = currentStage + 1;

  localStorage.setItem("currentStage", nextStage.toString());

  if (typeof switchToScreen === "function") {
    switchToScreen("game", 500);
  }
}

function goToToolSelect() {
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
  localStorage.removeItem("completedRecipe");
  localStorage.removeItem("recipeEmoji");
  localStorage.removeItem("gameDifficulty");
  localStorage.removeItem("gameResult");
  localStorage.removeItem("currentStage");
}

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
