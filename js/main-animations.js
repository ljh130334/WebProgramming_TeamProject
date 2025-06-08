$(document).ready(function () {
  // 페이지 로드 시 메인 화면 애니메이션 시작
  initMainAnimations();
});

function initMainAnimations() {
  // 타이핑 효과 시작
  startTypingEffect();

  // 떨어지는 요리 재료 생성
  createFallingIngredients();

  // 셰프 모자 생성
  createChefHats();

  // 메인 화면 전용 버튼 효과 추가
  addMainButtonEffects();
}

// ===========================================
// 메인 화면 전용 효과들
// ===========================================

// 1. 타이핑 효과 - 한글자씩 + 삭제 + 다른 제목
function startTypingEffect() {
  const titles = [
    '"셰프의 대결"',
    '"미식왕 전설"',
    '"요리의 마법사"',
    '"맛의 정복자"',
    '"부엌의 황제"',
  ];

  let currentTitleIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  const typeSpeed = 150;
  const deleteSpeed = 100;
  const pauseTime = 2000;

  function typeTitle() {
    const currentTitle = titles[currentTitleIndex];
    const $titleElement = $(".main-title");

    if (!isDeleting) {
      // 타이핑 중
      if (currentCharIndex < currentTitle.length) {
        const displayText = currentTitle.substring(0, currentCharIndex + 1);
        $titleElement.html(
          displayText + '<span class="typing-cursor">|</span>'
        );
        currentCharIndex++;
        setTimeout(typeTitle, typeSpeed);
      } else {
        // 타이핑 완료, 잠시 대기 후 삭제 시작
        setTimeout(() => {
          isDeleting = true;
          typeTitle();
        }, pauseTime);
      }
    } else {
      // 삭제 중
      if (currentCharIndex > 0) {
        const displayText = currentTitle.substring(0, currentCharIndex - 1);
        $titleElement.html(
          displayText + '<span class="typing-cursor">|</span>'
        );
        currentCharIndex--;
        setTimeout(typeTitle, deleteSpeed);
      } else {
        // 삭제 완료, 다음 제목으로
        isDeleting = false;
        currentTitleIndex = (currentTitleIndex + 1) % titles.length;
        setTimeout(typeTitle, 500);
      }
    }
  }

  // 시작
  setTimeout(typeTitle, 1000);
}

// 2. 떨어지는 요리 재료 생성 (메인 화면 전용)
function createFallingIngredients() {
  const ingredients = [
    "🥕",
    "🧅",
    "🥩",
    "🍅",
    "🥔",
    "🌽",
    "🥒",
    "🍆",
    "🥬",
    "🧄",
  ];

  setInterval(() => {
    if ($("#main").is(":visible") && !window.particlesDisabled) {
      const ingredient =
        ingredients[Math.floor(Math.random() * ingredients.length)];
      const $fallingItem = $('<div class="falling-ingredients"></div>');
      $fallingItem.text(ingredient);
      $fallingItem.css({
        left: Math.random() * 100 + "%",
        animationDuration: Math.random() * 3 + 4 + "s",
        animationDelay: Math.random() * 2 + "s",
      });

      $("#main").append($fallingItem);

      setTimeout(() => {
        $fallingItem.remove();
      }, 8000);
    }
  }, 1500);
}

// 3. 메인 화면 전용 버튼 효과
function addMainButtonEffects() {
  // 게임시작 버튼 호버 효과
  $("#start-game-btn").hover(
    function () {
      $(this).html("🔥 게임시작 🔥");
    },
    function () {
      $(this).html("게임시작");
    }
  );

  // 옵션 버튼 호버 효과
  $("#options-btn").hover(
    function () {
      $(this).html("⚙️ 옵션 ⚙️");
    },
    function () {
      $(this).html("옵션");
    }
  );
}

// ===========================================
// 메인 화면에서만 사용하는 강화된 파티클
// ===========================================

// 메인 화면 전용 강화된 불꽃 파티클
function createMainEnhancedFireParticles() {
  const particleTypes = ["small", "medium", "large"];

  // 메인 화면에서만 더 많은 파티클 생성
  setInterval(() => {
    if ($("#main").is(":visible") && !window.particlesDisabled) {
      for (let i = 0; i < 3; i++) {
        // 메인 화면에서는 추가 파티클
        const type =
          particleTypes[Math.floor(Math.random() * particleTypes.length)];
        const $particle = $(
          `<div class="fire-particle ${type} main-exclusive"></div>`
        );

        $particle.css({
          left: Math.random() * 100 + "%",
          bottom: "0px",
          animationDelay: Math.random() * 1 + "s",
          animationDuration: Math.random() * 2 + 2 + "s",
        });

        $("#main").append($particle);

        setTimeout(() => {
          $particle.remove();
        }, 4000);
      }
    }
  }, 200);
}

// 메인 화면 진입 시 특별한 시작 효과
function triggerMainScreenEntrance() {
  if (!window.particlesDisabled) {
    // 화면 중앙에서 환영 파티클 폭발
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const distance = 100 + Math.random() * 100;
      const particleX = centerX + Math.cos(angle) * distance;
      const particleY = centerY + Math.sin(angle) * distance;

      const $particle = $('<div class="welcome-particle"></div>');
      $particle.css({
        position: "fixed",
        left: centerX + "px",
        top: centerY + "px",
        width: "10px",
        height: "10px",
        background: `linear-gradient(45deg, ${
          ["#ff6b35", "#f7931e", "#ffaa4d"][Math.floor(Math.random() * 3)]
        }, transparent)`,
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
}

// ===========================================
// 화면 전환 이벤트 처리
// ===========================================

// 메인 화면 표시 시 효과 시작
$(document).on("screen-changed", function (e, screenId) {
  if (screenId === "main") {
    // 메인 화면 진입 효과
    setTimeout(triggerMainScreenEntrance, 300);

    // 메인 화면 전용 강화 파티클 시작
    createMainEnhancedFireParticles();
  } else {
    // 메인 화면이 아닐 때 메인 전용 파티클 정리
    $(".main-exclusive").remove();
  }
});

// ===========================================
// 메인 화면 전용 CSS 스타일 추가
// ===========================================

$("<style>")
  .text(
    `
  /* 떨어지는 요리 재료 애니메이션 */
  .falling-ingredients {
    position: absolute;
    top: -50px;
    font-size: 60px;
    animation: fall linear infinite;
    z-index: 1;
    opacity: 0.7;
    pointer-events: none;
  }

  @keyframes fall {
    0% {
      transform: translateY(-50px) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 0.7;
    }
    90% {
      opacity: 0.7;
    }
    100% {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }

  /* 셰프 모자 떠다니는 효과 */
  .chef-hat {
    position: absolute;
    font-size: 50px;
    animation: floatHat 8s ease-in-out infinite;
    z-index: 1;
    opacity: 0.6;
    pointer-events: none;
  }

  @keyframes floatHat {
    0%, 100% {
      transform: translate(0, 0) rotate(0deg);
    }
    25% {
      transform: translate(20px, -30px) rotate(5deg);
    }
    50% {
      transform: translate(-10px, -20px) rotate(-3deg);
    }
    75% {
      transform: translate(15px, -35px) rotate(7deg);
    }
  }

  /* 타이핑 커서 */
  .typing-cursor {
    display: inline-block;
    background-color: #fff;
    margin-left: 2px;
    width: 2px;
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%, 50% {
      opacity: 1;
    }
    51%, 100% {
      opacity: 0;
    }
  }

  /* 메인 화면 전용 파티클 강화 */
  .main-exclusive {
    box-shadow: 0 0 20px currentColor !important;
  }

  /* 환영 파티클 */
  .welcome-particle {
    animation: welcomeParticle 1.2s ease-out forwards;
  }

  @keyframes welcomeParticle {
    0% {
      opacity: 1;
      transform: scale(0.5);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
    100% {
      opacity: 0;
      transform: scale(0.3);
    }
  }

  /* 애니메이션 비활성화 시 메인 화면 요소들 */
  .no-animations .falling-ingredients,
  .no-animations .chef-hat {
    animation: none !important;
    opacity: 0 !important;
  }

  .no-animations .typing-cursor {
    animation: none !important;
    opacity: 1;
  }
`
  )
  .appendTo("head");
