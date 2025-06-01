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

  // 호버 효과
  $(".blackwhite-half").on("mouseenter", function () {
    if (!window.particlesDisabled) {
      createHoverEffect($(this));
    }
  });

  // 음양 이미지 클릭 시 재미있는 효과
  $(".yinyang-foreground").on("click", function (e) {
    e.preventDefault();
    if (!window.particlesDisabled) {
      createYinYangEffect(e.pageX, e.pageY);
    }
  });
}

// 흑백 선택화면 애니메이션 시작
function startBlackWhiteAnimations() {
  // 메인 화면과 동일한 파티클 효과 적용
  if (!window.particlesDisabled) {
    createBlackWhiteParticles();
    createFloatingElements();
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

  // 선택 파티클 효과
  if (!window.particlesDisabled) {
    createSelectionParticles($selectedHalf);
  }

  // 효과음 재생 (설정에서 음량 가져오기)
  if (typeof getSfxVolume === "function") {
    // 여기에 선택 효과음 재생 코드 추가
    console.log("선택 효과음 재생 - 볼륨:", getSfxVolume());
  }

  // 선택 데이터 저장
  sessionStorage.setItem("selectedSide", selectedSide);

  // 다음 화면으로 전환 (1.5초 후)
  setTimeout(() => {
    $("#black-white").hide();
    $("#tool-select").show();

    // 화면 변경 이벤트 발생
    $(document).trigger("screen-changed", ["tool-select"]);
  }, 1500);

  console.log("선택됨:", selectedSide);
}

// 호버 효과 파티클
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
    .css({
      animation: "none",
    })
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
  // 흑백 테마의 파티클들
  const blackWhiteParticles = ["⚫", "⚪"];

  setInterval(() => {
    if ($("#black-white").is(":visible") && !window.particlesDisabled) {
      for (let i = 0; i < 3; i++) {
        const particle =
          blackWhiteParticles[
            Math.floor(Math.random() * blackWhiteParticles.length)
          ];
        const $particle = $('<div class="floating-particle"></div>');

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
  }, 2000);
}

// CSS 애니메이션 추가 (JavaScript로 동적 생성)
$("<style>")
  .text(
    `
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
  
    @keyframes chefFloat {
      0%, 100% {
        transform: translate(0, 0) rotate(0deg);
      }
      25% {
        transform: translate(20px, -30px) rotate(5deg);
      }
      50% {
        transform: translate(-15px, -20px) rotate(-3deg);
      }
      75% {
        transform: translate(25px, -35px) rotate(7deg);
      }
    }
  
    .floating-particle,
    .floating-chef-element {
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
  `
  )
  .appendTo("head");
