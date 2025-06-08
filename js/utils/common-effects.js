// 모든 화면에서 사용할 수 있는 효과들

$(document).ready(function () {
  initGlobalEffects();
});

// 전역 효과 초기화
function initGlobalEffects() {
  // 전역 마우스 효과 등록
  setupGlobalMouseEffects();

  // 공통 배경 파티클 시작
  startGlobalParticles();
}

// ===========================================
// 마우스 효과 시스템
// ===========================================

function setupGlobalMouseEffects() {
  let mouseX = 0;
  let mouseY = 0;

  // 모든 화면에서 마우스 트레일 효과
  $(document).mousemove(function (e) {
    mouseX = e.pageX;
    mouseY = e.pageY;

    // 파티클이 활성화된 경우에만 효과 생성
    if (!window.particlesDisabled) {
      // 마우스 트레일 생성 (확률적으로)
      if (Math.random() < 0.5) {
        createMouseTrail(mouseX, mouseY);
      }

      // 마우스 파티클 생성 (더 낮은 확률)
      if (Math.random() < 0.2) {
        createMouseParticle(mouseX, mouseY);
      }
    }
  });

  // 전역 클릭 효과
  $(document).click(function (e) {
    if (!window.particlesDisabled) {
      createMouseClickEffect(e.pageX, e.pageY);
    }
  });
}

// 마우스 트레일 생성
function createMouseTrail(x, y) {
  const $trail = $('<div class="mouse-trail"></div>');
  $trail.css({
    left: x - 10 + "px",
    top: y - 10 + "px",
  });

  $("body").append($trail);

  setTimeout(() => {
    $trail.remove();
  }, 1000);
}

// 마우스 주변 파티클
function createMouseParticle(x, y) {
  const $particle = $('<div class="mouse-particle"></div>');
  $particle.css({
    left: x + (Math.random() - 0.5) * 20 + "px",
    top: y + (Math.random() - 0.5) * 20 + "px",
  });

  $("body").append($particle);

  setTimeout(() => {
    $particle.remove();
  }, 2000);
}

// 마우스 클릭 시 폭발 효과
function createMouseClickEffect(x, y) {
  // 클릭 시 큰 불꽃 효과
  const $clickFire = $('<div class="fire-explosion"></div>');
  $clickFire.css({
    left: x - 15 + "px",
    top: y - 15 + "px",
  });

  $("body").append($clickFire);

  // 주변에 작은 파티클들 생성
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const distance = 30 + Math.random() * 20;
    const particleX = x + Math.cos(angle) * distance;
    const particleY = y + Math.sin(angle) * distance;

    const $particle = $('<div class="mouse-particle"></div>');
    $particle.css({
      left: particleX + "px",
      top: particleY + "px",
      background: ["#ff4500", "#ff6b35", "#ffa500", "#ffff00"][
        Math.floor(Math.random() * 4)
      ],
    });

    $("body").append($particle);

    setTimeout(() => {
      $particle.remove();
    }, 2000);
  }

  setTimeout(() => {
    $clickFire.remove();
  }, 1500);
}

// ===========================================
// 공통 배경 파티클 시스템
// ===========================================

function startGlobalParticles() {
  // 화면 하단에서 올라오는 불꽃 파티클
  startBottomFireParticles();

  // 가끔 나타나는 큰 폭발 효과
  startRandomExplosions();
}

// 화면 하단 불꽃 파티클
function startBottomFireParticles() {
  const particleTypes = ["small", "medium", "large"];

  setInterval(() => {
    if (!window.particlesDisabled) {
      const currentScreen = getCurrentVisibleScreen();
      const particleCount = getParticleCountForScreen(currentScreen);

      for (let i = 0; i < particleCount; i++) {
        const type =
          particleTypes[Math.floor(Math.random() * particleTypes.length)];
        const $particle = $(`<div class="fire-particle ${type}"></div>`);

        $particle.css({
          left: Math.random() * 100 + "%",
          bottom: "0px",
          animationDelay: Math.random() * 1 + "s",
          animationDuration: Math.random() * 2 + 2 + "s",
        });

        $("body").append($particle);

        setTimeout(() => {
          $particle.remove();
        }, 4000);
      }
    }
  }, 400);
}

// 랜덤 폭발 효과
function startRandomExplosions() {
  setInterval(() => {
    if (!window.particlesDisabled) {
      const currentScreen = getCurrentVisibleScreen();

      // 메인 화면이 아닌 경우 폭발 효과 줄이기
      if (currentScreen !== "main" && Math.random() < 0.7) return;

      const $explosion = $('<div class="fire-explosion"></div>');
      $explosion.css({
        left: Math.random() * 100 + "%",
        bottom: "20px",
      });

      $("body").append($explosion);

      // 폭발과 함께 작은 파티클들 생성
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          const $miniParticle = $('<div class="fire-particle small"></div>');
          $miniParticle.css({
            left: $explosion.css("left"),
            bottom: "20px",
            animationDuration: "1s",
          });
          $("body").append($miniParticle);

          setTimeout(() => {
            $miniParticle.remove();
          }, 1000);
        }, i * 50);
      }

      setTimeout(() => {
        $explosion.remove();
      }, 1500);
    }
  }, 5000);
}

// ===========================================
// 유틸리티 함수들
// ===========================================

// 현재 보이는 화면 감지
function getCurrentVisibleScreen() {
  if ($("#main").is(":visible")) return "main";
  if ($("#black-white").is(":visible")) return "black-white";
  if ($("#tool-select").is(":visible")) return "tool-select";
  if ($("#difficulty-select").is(":visible")) return "difficulty-select";
  if ($("#game").is(":visible")) return "game";
  if ($("#success").is(":visible")) return "success";
  if ($("#failure").is(":visible")) return "failure";
  return "unknown";
}

// 화면별 파티클 수 조정
function getParticleCountForScreen(screen) {
  switch (screen) {
    case "main":
      return 5; // 메인 화면: 많은 파티클
    case "black-white":
      return 3; // 흑백 선택: 중간
    case "tool-select":
    case "difficulty-select":
      return 2; // 선택 화면: 적음
    case "game":
      return 1; // 게임 중: 최소
    default:
      return 2;
  }
}

// ===========================================
// 버튼 공통 효과
// ===========================================

// 모든 버튼에 클릭 파티클 효과 추가
function addGlobalButtonEffects() {
  $(document).on("click", "button, .clickable", function (e) {
    if (!window.particlesDisabled) {
      createClickParticles(e);
    }
  });
}

// 클릭 시 파티클 생성
function createClickParticles(event) {
  const colors = ["#ff6b35", "#f7931e", "#ffaa4d", "#ff8c42"];

  for (let i = 0; i < 6; i++) {
    const $particle = $("<div></div>");
    $particle.css({
      position: "fixed",
      width: "6px",
      height: "6px",
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      borderRadius: "50%",
      left: event.pageX + "px",
      top: event.pageY + "px",
      pointerEvents: "none",
      zIndex: 1000,
    });

    $("body").append($particle);

    $particle.animate(
      {
        left: event.pageX + (Math.random() - 0.5) * 80 + "px",
        top: event.pageY + (Math.random() - 0.5) * 80 + "px",
        opacity: 0,
      },
      800,
      function () {
        $(this).remove();
      }
    );
  }
}

// 전역 버튼 효과 시작
$(document).ready(function () {
  addGlobalButtonEffects();
});

// ===========================================
// 화면별 특수 효과 관리
// ===========================================

// 화면 변경 이벤트 리스너
$(document).on("screen-changed", function (e, screenId) {
  console.log("화면 전환됨:", screenId);

  // 화면별 특수 파티클 정리
  cleanupScreenSpecificParticles();

  // 새 화면 전용 효과 시작
  startScreenSpecificEffects(screenId);
});

// 화면별 파티클 정리
function cleanupScreenSpecificParticles() {
  // 특정 화면 전용 파티클들 제거
  $(".screen-specific-particle").remove();
}

// 화면별 특수 효과 시작
function startScreenSpecificEffects(screenId) {
  switch (screenId) {
    case "main":
      // 메인 화면 전용 효과는 main-animations.js에서 관리
      break;
    case "black-white":
      // 흑백 화면 전용 효과는 blackwhite.js에서 관리
      break;
    // 다른 화면들도 필요시 추가
  }
}

// ===========================================
// 전역 변수 및 설정
// ===========================================

// 파티클 시스템 전역 설정
window.globalParticleSettings = {
  mouseTrailIntensity: 0.5,
  backgroundParticleIntensity: 1.0,
  explosionFrequency: 1.0,
};

// 설정에 따른 효과 강도 조절 함수
window.adjustGlobalEffects = function (particlesEnabled, intensity = 1.0) {
  window.particlesDisabled = !particlesEnabled;
  window.globalParticleSettings.backgroundParticleIntensity = intensity;
};
