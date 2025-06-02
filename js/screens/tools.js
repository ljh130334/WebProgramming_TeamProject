// 조리도구 선택 화면 JavaScript
$(document).ready(function () {
  initToolSelectScreen();
});

function initToolSelectScreen() {
  // 화면 표시 시 초기화
  $(document).on("screen-changed", function (e, screenId) {
    if (screenId === "tool-select") {
      startToolSelectAnimations();
    }
  });

  // 도구 클릭 이벤트
  $(document).on("click", ".tool-wrapper", function () {
    const $tool = $(this).find(".tool");

    if ($tool.hasClass("disabled")) {
      handleDisabledToolClick($tool);
      return;
    }

    const toolName = $tool.data("tool");
    handleToolSelection($tool, toolName);
  });

  // 도구 호버 효과
  $(document).on("mouseenter", ".tool-wrapper", function () {
    const $tool = $(this).find(".tool");

    if (!$tool.hasClass("disabled")) {
      showToolDescription($tool);

      if (!window.particlesDisabled) {
        createToolHoverEffect($tool);
      }
    }
  });

  $(document).on("mouseleave", ".tool-wrapper", function () {
    hideToolDescription();
  });
}

// ===========================================
// 도구 선택 화면 애니메이션
// ===========================================

function startToolSelectAnimations() {
  // 도구들 순차 등장
  animateToolsEntry();
}

// ===========================================
// 도구 선택 처리
// ===========================================

function handleToolSelection(selectedTool, toolName) {
  console.log("도구 선택:", toolName);

  // 다른 도구들 비활성화
  $(".tool").not(selectedTool).addClass("selecting");

  // 선택된 도구 강조
  selectedTool.addClass("selected");

  // 선택 파티클 효과
  if (!window.particlesDisabled) {
    createToolSelectionParticles(selectedTool);
  }

  // 효과음 재생
  if (typeof getSfxVolume === "function") {
    console.log("도구 선택 효과음 재생 - 볼륨:", getSfxVolume());
  }

  // 선택 데이터 저장
  if (window.gameData) {
    window.gameData.selectedTool = toolName;
  }
  sessionStorage.setItem("selectedTool", toolName);

  // 성공 메시지 표시
  showToolSelectionMessage(toolName);

  // 다음 화면으로 전환 (2초 후)
  setTimeout(() => {
    if (typeof switchToScreen === "function") {
      switchToScreen("difficulty-select", 500);
    }
  }, 2000);
}

// 비활성화된 도구 클릭 처리
function handleDisabledToolClick($tool) {
  // 흔들기 애니메이션
  $tool.addClass("shake");
  setTimeout(() => {
    $tool.removeClass("shake");
  }, 600);

  // 잠금 파티클 효과
  if (!window.particlesDisabled) {
    createLockParticles($tool);
  }

  // 알림 메시지
  showNotification("이 도구는 아직 잠겨있습니다! 🔒");
}

// ===========================================
// 도구 설명 시스템
// ===========================================

const toolDescriptions = {
  Wok: {
    name: "웍 (Wok)",
    description:
      "빠른 열전도와 넓은 조리면으로 볶음 요리에 최적화된 도구입니다.",
  },
  Knife: {
    name: "나이프 (Knife)",
    description:
      "정밀한 칼질로 재료를 완벽하게 준비할 수 있는 기본 도구입니다.",
  },
  "Gold Pan": {
    name: "황금 팬 (Gold Pan)",
    description: "전설의 요리사만이 사용할 수 있는 특별한 조리도구입니다.",
  },
  "Gold Turner": {
    name: "황금 뒤집개 (Gold Turner)",
    description: "마스터 셰프의 증표, 완벽한 뒤집기가 가능한 도구입니다.",
  },
};

function showToolDescription($tool) {
  const toolName = $tool.data("tool");
  const description = toolDescriptions[toolName];

  if (description) {
    const $descPanel = $("#tool-description");
    $descPanel.html(`
      <h3>${description.name}</h3>
      <p>${description.description}</p>
    `);
    $descPanel.addClass("show");
  }
}

function hideToolDescription() {
  $("#tool-description").removeClass("show");
}

// ===========================================
// 파티클 효과
// ===========================================

// 도구 호버 파티클 효과
function createToolHoverEffect($tool) {
  const rect = $tool[0].getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const $particle = $('<div class="tool-hover-particle"></div>');
      $particle.css({
        position: "fixed",
        left: centerX + (Math.random() - 0.5) * 100 + "px",
        top: centerY + (Math.random() - 0.5) * 100 + "px",
        width: "8px",
        height: "8px",
        background: "radial-gradient(circle, #ff6b35, #f7931e)",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 10,
        animation: "toolHoverParticle 1.5s ease-out forwards",
      });

      $("body").append($particle);

      setTimeout(() => {
        $particle.remove();
      }, 1500);
    }, i * 100);
  }
}

// 도구 선택 시 파티클 효과
function createToolSelectionParticles($tool) {
  const rect = $tool[0].getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // 폭발 효과
  for (let i = 0; i < 25; i++) {
    const angle = (i / 25) * Math.PI * 2;
    const distance = 60 + Math.random() * 80;
    const particleX = centerX + Math.cos(angle) * distance;
    const particleY = centerY + Math.sin(angle) * distance;

    const $particle = $('<div class="tool-selection-particle"></div>');
    $particle.css({
      position: "fixed",
      left: centerX + "px",
      top: centerY + "px",
      width: "12px",
      height: "12px",
      background: getToolColor($tool.data("tool")),
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: 10,
      boxShadow: "0 0 15px currentColor",
    });

    $("body").append($particle);

    setTimeout(() => {
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
    }, 100);
  }

  // 중앙 폭발 효과
  const $centerExplosion = $('<div class="tool-center-explosion"></div>');
  $centerExplosion.css({
    position: "fixed",
    left: centerX - 30 + "px",
    top: centerY - 30 + "px",
    width: "60px",
    height: "60px",
    background: `radial-gradient(circle, ${getToolColor(
      $tool.data("tool")
    )}, transparent)`,
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 10,
    animation: "toolCenterExplosion 1.5s ease-out forwards",
  });

  $("body").append($centerExplosion);

  setTimeout(() => {
    $centerExplosion.remove();
  }, 1500);
}

// 잠금 파티클 효과
function createLockParticles($tool) {
  const rect = $tool[0].getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < 8; i++) {
    const $particle = $('<div class="lock-particle">🔒</div>');
    $particle.css({
      position: "fixed",
      left: centerX + "px",
      top: centerY + "px",
      fontSize: "24px",
      color: "#888",
      pointerEvents: "none",
      zIndex: 10,
    });

    $("body").append($particle);

    $particle.animate(
      {
        left: centerX + (Math.random() - 0.5) * 120 + "px",
        top: centerY + (Math.random() - 0.5) * 120 + "px",
        opacity: 0,
      },
      1500,
      function () {
        $(this).remove();
      }
    );
  }
}

// ===========================================
// 유틸리티 함수들
// ===========================================

// 도구별 색상 반환
function getToolColor(toolName) {
  const colors = {
    Wok: "#FFA500",
    Knife: "#C0C0C0",
    "Gold Pan": "#FFD700",
    "Gold Turner": "#FFD700",
  };
  return colors[toolName] || "#ff6b35";
}

// 도구 선택 성공 메시지
function showToolSelectionMessage(toolName) {
  const description = toolDescriptions[toolName];

  const $message = $('<div class="tool-selection-message"></div>');
  $message.html(`
    <div class="selection-icon">✨</div>
    <div class="selection-text">${description.name} 선택!</div>
    <div class="selection-subtext">다음 단계로 이동합니다...</div>
  `);

  $("#tool-select").append($message);

  setTimeout(() => {
    $message.fadeOut(500, function () {
      $(this).remove();
    });
  }, 1500);
}

// 알림 표시 함수
function showNotification(message) {
  const $notification = $('<div class="settings-notification"></div>');
  $notification.text(message);

  $("body").append($notification);

  setTimeout(() => {
    $notification.css("transform", "translateX(0)");
  }, 100);

  setTimeout(() => {
    $notification.css("transform", "translateX(100%)");
    setTimeout(() => {
      $notification.remove();
    }, 300);
  }, 3000);
}

// ===========================================
// CSS 애니메이션 추가
// ===========================================

$("<style>")
  .text(
    `
  @keyframes toolHoverParticle {
    0% {
      opacity: 1;
      transform: scale(0.5);
    }
    100% {
      opacity: 0;
      transform: scale(2.5) translateY(-40px);
    }
  }

  @keyframes toolCenterExplosion {
    0% {
      opacity: 1;
      transform: scale(0.2);
    }
    50% {
      opacity: 1;
      transform: scale(2.5);
    }
    100% {
      opacity: 0;
      transform: scale(0.8);
    }
  }

  @keyframes toolFloatUp {
    0% {
      transform: translateY(0px) rotate(0deg);
      opacity: 0;
    }
    10% {
      opacity: 0.4;
    }
    90% {
      opacity: 0.4;
    }
    100% {
      transform: translateY(-100vh) rotate(180deg);
      opacity: 0;
    }
  }
`
  )
  .appendTo("head");

// ===========================================
// 화면 전환 이벤트 처리
// ===========================================

$(document).on("screen-changed", function (e, screenId) {
  if (screenId === "tool-select") {
    // 도구 선택 화면 진입 효과
    setTimeout(() => {
      if (!window.particlesDisabled) {
        createToolScreenEntrance();
      }
    }, 500);
  } else {
    // 도구 선택 화면 전용 파티클 정리
    $(".tool-exclusive").remove();
  }
});

// 도구 선택 화면 진입 시 환영 효과
function createToolScreenEntrance() {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const distance = 100 + Math.random() * 100;
    const particleX = centerX + Math.cos(angle) * distance;
    const particleY = centerY + Math.sin(angle) * distance;

    const $particle = $('<div class="tool-entrance-particle"></div>');
    $particle.css({
      position: "fixed",
      left: centerX + "px",
      top: centerY + "px",
      width: "10px",
      height: "10px",
      background: ["#ff6b35", "#f7931e", "#ffaa4d", "#ff8c42"][
        Math.floor(Math.random() * 4)
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
      1500,
      function () {
        $(this).remove();
      }
    );
  }
}
