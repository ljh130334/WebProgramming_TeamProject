// 성공/실패 화면 로직 - 통합 디자인
$(document).ready(function () {
  initResultScreens();
});

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
// 성공 화면 처리
// ===========================================

function handleSuccessScreen() {
  const recipeName = sessionStorage.getItem("completedRecipe") || "요리";
  const recipeEmoji = sessionStorage.getItem("recipeEmoji") || "🍽️";
  const difficulty = sessionStorage.getItem("gameDifficulty") || "Easy";

  const difficultyText = {
    Easy: "쉬움",
    Normal: "보통",
    Hard: "어려움",
  };

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
            ${recipeName} 완성!
          </div>
          
          <div class="result-subtitle success-subtitle">
            ${difficultyText[difficulty]} 난이도를 클리어했습니다!
          </div>
          
          <div class="result-message">
            맛있어요. 진짜 맛있어요.
          </div>
          
          <div class="result-timer" id="success-timer">
            <span>10초 뒤 메인 화면으로 돌아갑니다</span>
          </div>
          
          <div class="result-buttons">
            <button class="result-btn primary-btn" id="success-continue">
              🏠 메인으로
            </button>
            <button class="result-btn secondary-btn" id="success-replay">
              🔄 다시하기
            </button>
          </div>
        </div>
        
        <!-- 클릭 힌트 -->
        <div class="click-hint">
          화면을 클릭하면 빠르게 넘어갑니다
        </div>
      </div>
    `;

  $("#success").html(successHtml);

  // 타이머 시작
  let countdown = 10;
  const timer = setInterval(() => {
    countdown--;
    $("#success-timer span").text(`${countdown}초 뒤 메인 화면으로 돌아갑니다`);

    if (countdown <= 0) {
      clearInterval(timer);
      goToMain();
    }
  }, 1000);

  // 성공 파티클 효과
  if (!window.particlesDisabled) {
    createSuccessParticles(recipeEmoji);
  }

  // 버튼 이벤트
  $("#success-continue").on("click", () => {
    clearInterval(timer);
    goToMain();
  });

  $("#success-replay").on("click", () => {
    clearInterval(timer);
    goToGame();
  });

  // 화면 클릭 이벤트
  $("#success").on("click", (e) => {
    if (e.target.id === "success" || $(e.target).hasClass("result-container")) {
      clearInterval(timer);
      goToMain();
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
            ${recipeName} 만들기 실패!
          </div>
          
          <div class="result-subtitle failure-subtitle">
            ${difficultyText[difficulty]} 난이도에 다시 도전해보세요!
          </div>
          
          <div class="result-message">
            이븐하지 않잖아요!
          </div>
          
          <div class="result-timer" id="failure-timer">
            <span>10초 뒤 다시 도전할 수 있습니다</span>
          </div>
          
          <div class="result-buttons">
            <button class="result-btn primary-btn" id="failure-retry">
              🔄 다시하기
            </button>
            <button class="result-btn secondary-btn" id="failure-difficulty">
              ⚙️ 난이도 변경
            </button>
            <button class="result-btn tertiary-btn" id="failure-home">
              🏠 메인으로
            </button>
          </div>
        </div>
        
        <!-- 클릭 힌트 -->
        <div class="click-hint">
          화면을 클릭하면 빠르게 넘어갑니다
        </div>
      </div>
    `;

  $("#failure").html(failureHtml);

  // 타이머 시작
  let countdown = 10;
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
  $("#failure-retry").on("click", () => {
    clearInterval(timer);
    goToGame();
  });

  $("#failure-difficulty").on("click", () => {
    clearInterval(timer);
    if (typeof switchToScreen === "function") {
      switchToScreen("difficulty-select", 500);
    }
  });

  $("#failure-home").on("click", () => {
    clearInterval(timer);
    goToMain();
  });

  // 화면 클릭 이벤트
  $("#failure").on("click", (e) => {
    if (e.target.id === "failure" || $(e.target).hasClass("result-container")) {
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

function clearSessionData() {
  sessionStorage.removeItem("completedRecipe");
  sessionStorage.removeItem("recipeEmoji");
  sessionStorage.removeItem("gameDifficulty");
  sessionStorage.removeItem("gameResult");
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
