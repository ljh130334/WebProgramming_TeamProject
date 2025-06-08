$(document).ready(function () {
  initBlackWhiteScreen();
});

function initBlackWhiteScreen() {
  // 화면이 표시될 때 초기화
  $(document).on("screen-changed", function (e, screenId) {
    if (screenId === "black-white") {
      startBlackWhiteAnimations();
    }
  });

  // 흑백 선택 이벤트
  $(".blackwhite-half").on("click", function () {
    const selectedSide = $(this).hasClass("blackwhite-left")
      ? "black"
      : "white";
    handleSelection(selectedSide);
  });

  // 호버 효과 (공통 파티클 사용)
  $(".blackwhite-half").on("mouseenter", function () {
    if (!window.particlesDisabled) {
      createHoverEffect($(this));
    }
  });

  $(".yinyang-foreground").on("click", function (e) {
    e.preventDefault();
    if (!window.particlesDisabled) {
      createYinYangEffect(e.pageX, e.pageY);
    }
  });
}

// ===========================================
// 흑백 화면 전용 애니메이션
// ===========================================

function startBlackWhiteAnimations() {
  // 흑백 화면 전용 파티클 효과
  if (!window.particlesDisabled) {
    createBlackWhiteParticles();
  }

  // 음양 이미지 회전 효과
  $(".yinyang-foreground").css("animation-play-state", "running");
}

// 흑백 선택 처리
function handleSelection(selectedSide) {
  const $selectedHalf =
    selectedSide === "black" ? $(".blackwhite-left") : $(".blackwhite-right");

  // 선택 효과 표시
  $selectedHalf.addClass("selected");

  // 선택 파티클 효과 (공통 파티클 재사용)
  if (!window.particlesDisabled) {
    createSelectionParticles($selectedHalf);
  }

  // 선택 데이터 저장
  sessionStorage.setItem("selectedSide", selectedSide);

  // 다음 화면으로 전환 (1.5초 후)
  setTimeout(() => {
    $("#black-white").hide();
    $("#tool-select").show();
    $(document).trigger("screen-changed", ["tool-select"]);
  }, 1500);

  console.log("선택됨:", selectedSide);
}

// ===========================================
// 흑백 화면 전용 효과들
// ===========================================

// 호버 효과 파티클 (공통 selection-particle 사용)
function createHoverEffect($element) {
  const rect = $element[0].getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const $particle = $('<div class="selection-particle"></div>');
      $particle.css({
        position: "fixed",
        left: centerX + (Math.random() - 0.5) * 100 + "px",
        top: centerY + (Math.random() - 0.5) * 100 + "px",
      });

      $("body").append($particle);

      setTimeout(() => {
        $particle.remove();
      }, 1500);
    }, i * 100);
  }
}

// 선택 시 파티클 효과
function createSelectionParticles($element) {
  const rect = $element[0].getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // 중앙에서 퍼지는 파티클들
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const distance = 80 + Math.random() * 40;
    const particleX = centerX + Math.cos(angle) * distance;
    const particleY = centerY + Math.sin(angle) * distance;

    const $particle = $('<div class="selection-particle"></div>');
    $particle.css({
      position: "fixed",
      left: centerX + "px",
      top: centerY + "px",
      animationDelay: i * 0.05 + "s",
    });

    $("body").append($particle);

    // 파티클을 목표 지점으로 이동
    setTimeout(() => {
      $particle.animate(
        {
          left: particleX + "px",
          top: particleY + "px",
        },
        800,
        "easeOutQuart"
      );
    }, 50);

    setTimeout(() => {
      $particle.remove();
    }, 1500);
  }

  // 선택된 영역에 글로우 효과
  $element.addClass("selected");
}

// 음양 클릭 효과
function createYinYangEffect(x, y) {
  const colors = ["#000", "#fff", "#ff6b35", "#f7931e"];

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 50 + Math.random() * 30;
    const particleX = x + Math.cos(angle) * distance;
    const particleY = y + Math.sin(angle) * distance;

    const $particle = $("<div></div>");
    $particle.css({
      position: "fixed",
      left: x + "px",
      top: y + "px",
      width: "12px",
      height: "12px",
      background: colors[Math.floor(Math.random() * colors.length)],
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: 1000,
      boxShadow: "0 0 10px currentColor",
    });

    $("body").append($particle);

    $particle.animate(
      {
        left: particleX + "px",
        top: particleY + "px",
        opacity: 0,
      },
      1200,
      function () {
        $(this).remove();
      }
    );
  }

  // 음양 이미지 회전 효과
  $(".yinyang-foreground")
    .css({ animation: "none" })
    .animate(
      {
        deg: 360,
      },
      {
        duration: 1000,
        step: function (now) {
          $(this).css({
            transform: `translate(-50%, -50%) rotate(${now}deg) scale(1.1)`,
          });
        },
        complete: function () {
          $(this).css({
            transform: "translate(-50%, -50%)",
            animation: "float 8s ease-in-out infinite",
          });
        },
      }
    );
}

// 흑백 화면용 파티클 효과
function createBlackWhiteParticles() {
  const blackWhiteParticles = ["⚫", "⚪"];

  setInterval(() => {
    if ($("#black-white").is(":visible") && !window.particlesDisabled) {
      for (let i = 0; i < 2; i++) {
        const particle =
          blackWhiteParticles[
            Math.floor(Math.random() * blackWhiteParticles.length)
          ];
        const $particle = $(
          '<div class="floating-particle blackwhite-exclusive"></div>'
        );

        $particle
          .css({
            position: "absolute",
            left: Math.random() * 100 + "%",
            bottom: "-50px",
            fontSize: "30px",
            opacity: 0.6,
            zIndex: 1,
            pointerEvents: "none",
            animation: `floatUp ${3 + Math.random() * 2}s linear infinite`,
            animationDelay: Math.random() * 2 + "s",
          })
          .text(particle);

        $("#black-white").append($particle);

        setTimeout(() => {
          $particle.remove();
        }, 6000);
      }
    }
  }, 3000);
}

// ===========================================
// 흑백 화면 전용 CSS 추가
// ===========================================

$("<style>")
  .text(
    `
    /* 흑백 화면 떠오르는 파티클 */
    @keyframes floatUp {
      0% {
        transform: translateY(0px) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 0.6;
      }
      90% {
        opacity: 0.6;
      }
      100% {
        transform: translateY(-100vh) rotate(360deg);
        opacity: 0;
      }
    }
  
    .floating-particle {
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
  
    .blackwhite-exclusive {
      transition: opacity 0.3s ease;
    }
  `
  )
  .appendTo("head");

// 화면 전환 시 흑백 전용 파티클 정리
$(document).on("screen-changed", function (e, screenId) {
  if (screenId !== "black-white") {
    $(".blackwhite-exclusive").fadeOut(300, function () {
      $(this).remove();
    });
  }
});
