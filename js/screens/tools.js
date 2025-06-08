$(document).ready(function () {
  initToolSelectScreen();
});

function initToolSelectScreen() {
  $(document).on("screen-changed", function (e, screenId) {
    if (screenId === "tool-select") {
      updateToolAvailability();
      startToolSelectAnimations();
    }
  });

  $(document)
    .off("click", ".tool-wrapper")
    .on("click", ".tool-wrapper", function (e) {
      e.stopPropagation();
      const $tool = $(this).find(".tool");

      if ($tool.hasClass("disabled")) {
        handleDisabledToolClick($tool);
        return;
      }

      const toolName = $tool.data("tool");
      handleToolSelection($tool, toolName);
    });

  $(document).on("mouseenter", ".tool-wrapper", function () {
    const $tool = $(this).find(".tool");

    if (!$tool.hasClass("disabled")) {
      showToolDescription($tool);

      if (!window.particlesDisabled) {
        createToolHoverEffect($tool);
      }
    } else {
      showLockedToolDescription($tool);
    }
  });

  $(document).on("mouseleave", ".tool-wrapper", function () {
    hideToolDescription();
  });
}

function updateToolAvailability() {
  const gameProgress =
    typeof window.getGameProgress === "function"
      ? window.getGameProgress()
      : { unlockedTools: ["Wok", "Knife"] };

  const lastCompletedStage = parseInt(
    localStorage.getItem("lastCompletedStage") || "0"
  );

  if (
    lastCompletedStage >= 1 &&
    !gameProgress.unlockedTools.includes("Gold Pan")
  ) {
    gameProgress.unlockedTools.push("Gold Pan");
  }

  if (
    lastCompletedStage >= 2 &&
    !gameProgress.unlockedTools.includes("Gold Turner")
  ) {
    gameProgress.unlockedTools.push("Gold Turner");
  }

  $(".tool").each(function () {
    const toolName = $(this).data("tool");
    const $toolWrapper = $(this).closest(".tool-wrapper");

    if (gameProgress.unlockedTools.includes(toolName)) {
      $(this).removeClass("disabled");
      updateToolImage($(this), toolName, false);

      if (toolName === "Gold Pan" || toolName === "Gold Turner") {
        $toolWrapper.addClass("newly-unlocked");
        setTimeout(() => {
          $toolWrapper.removeClass("newly-unlocked");
        }, 3000);
      }
    } else {
      $(this).addClass("disabled");
      updateToolImage($(this), toolName, true);
    }
  });

  showUnlockNotifications(gameProgress);
}

function updateToolImage($tool, toolName, isLocked) {
  const imageMap = {
    Wok: isLocked
      ? "assets/images/tools/wok_disabled.png"
      : "assets/images/tools/wok.png",
    Knife: isLocked
      ? "assets/images/tools/knife_disabled.png"
      : "assets/images/tools/knife.png",
    "Gold Pan": isLocked
      ? "assets/images/tools/golden_pan_disabled.png"
      : "assets/images/tools/golden_pan.png",
    "Gold Turner": isLocked
      ? "assets/images/tools/golden_turner_disabled.png"
      : "assets/images/tools/golden_turner.png",
  };

  if (imageMap[toolName]) {
    $tool.attr("src", imageMap[toolName]);
  }
}

function showUnlockNotifications(gameProgress) {
  const newlyUnlocked = [];

  if (
    gameProgress.unlockedTools.includes("Gold Pan") &&
    !sessionStorage.getItem("goldPanNotified")
  ) {
    newlyUnlocked.push("황금 팬");
    sessionStorage.setItem("goldPanNotified", "true");
  }

  if (
    gameProgress.unlockedTools.includes("Gold Turner") &&
    !sessionStorage.getItem("goldTurnerNotified")
  ) {
    newlyUnlocked.push("황금 뒤집개");
    sessionStorage.setItem("goldTurnerNotified", "true");
  }

  if (newlyUnlocked.length > 0) {
    showToolUnlockNotification(newlyUnlocked);
  }
}

function startToolSelectAnimations() {
  animateToolsEntry();
}

function animateToolsEntry() {
  $(".tool-wrapper").each(function (index) {
    $(this)
      .css({
        opacity: "0",
        transform: "translateY(50px)",
      })
      .delay(index * 200)
      .animate(
        {
          opacity: 1,
        },
        500
      )
      .queue(function (next) {
        $(this).css("transform", "translateY(0)");
        next();
      });
  });
}

function handleToolSelection(selectedTool, toolName) {
  $(".tool").not(selectedTool).addClass("selecting");

  selectedTool.addClass("selected");

  if (!window.particlesDisabled) {
    createToolSelectionParticles(selectedTool);
  }

  if (window.gameData) {
    window.gameData.selectedTool = toolName;
  }
  localStorage.setItem("selectedTool", toolName);

  showToolSelectionMessage(toolName);

  setTimeout(() => {
    if (typeof switchToScreen === "function") {
      switchToScreen("difficulty-select", 500);
    }
  }, 2000);
}

function handleDisabledToolClick($tool) {
  const toolName = $tool.data("tool");

  $tool.addClass("shake");
  setTimeout(() => {
    $tool.removeClass("shake");
  }, 600);

  if (!window.particlesDisabled) {
    createLockParticles($tool);
  }

  let unlockMessage = "이 도구는 아직 잠겨있습니다! 🔒";
  if (toolName === "Gold Pan") {
    unlockMessage = "1단계를 클리어하면 황금 팬이 해제됩니다! 🔒";
  } else if (toolName === "Gold Turner") {
    unlockMessage = "2단계를 클리어하면 황금 뒤집개가 해제됩니다! 🔒";
  }

  showNotification(unlockMessage);
}

const toolDescriptions = {
  Wok: {
    name: "웍 (Wok)",
    description:
      "빠른 열전도와 넓은 조리면으로 볶음 요리에 최적화된 도구입니다.",
    stats: "기본 도구 | 속도: ⭐⭐⭐ | 효율: ⭐⭐⭐",
  },
  Knife: {
    name: "나이프 (Knife)",
    description:
      "정밀한 칼질로 재료를 완벽하게 준비할 수 있는 기본 도구입니다.",
    stats: "기본 도구 | 정확도: ⭐⭐⭐ | 속도: ⭐⭐⭐",
  },
  "Gold Pan": {
    name: "황금 팬 (Gold Pan)",
    description: "전설의 요리사만이 사용할 수 있는 특별한 조리도구입니다.",
    stats: "특수 도구 | 속도: ⭐⭐⭐⭐ | 효율: ⭐⭐⭐⭐ | 보너스 점수",
  },
  "Gold Turner": {
    name: "황금 뒤집개 (Gold Turner)",
    description: "마스터 셰프의 증표, 완벽한 뒤집기가 가능한 도구입니다.",
    stats: "마스터 도구 | 정확도: ⭐⭐⭐⭐⭐ | 특수 능력: 자동 콤보",
  },
};

const lockedToolMessages = {
  "Gold Pan": {
    name: "황금 팬 (잠김)",
    description: "1단계를 클리어하면 사용할 수 있습니다.",
    unlock: "해제 조건: 1단계 클리어",
  },
  "Gold Turner": {
    name: "황금 뒤집개 (잠김)",
    description: "2단계를 클리어하면 사용할 수 있습니다.",
    unlock: "해제 조건: 2단계 클리어",
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
      <div class="tool-stats">${description.stats}</div>
    `);
    $descPanel.addClass("show");
  }
}

function showLockedToolDescription($tool) {
  const toolName = $tool.data("tool");
  const lockedInfo = lockedToolMessages[toolName];

  if (lockedInfo) {
    const $descPanel = $("#tool-description");
    $descPanel.html(`
      <h3>${lockedInfo.name}</h3>
      <p>${lockedInfo.description}</p>
      <div class="tool-unlock-condition">${lockedInfo.unlock}</div>
    `);
    $descPanel.addClass("show locked");
  }
}

function hideToolDescription() {
  $("#tool-description").removeClass("show locked");
}

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

function createToolSelectionParticles($tool) {
  const rect = $tool[0].getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

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

function getToolColor(toolName) {
  const colors = {
    Wok: "#FFA500",
    Knife: "#C0C0C0",
    "Gold Pan": "#FFD700",
    "Gold Turner": "#FFD700",
  };
  return colors[toolName] || "#ff6b35";
}

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

function showToolUnlockNotification(unlockedTools) {
  const $notification = $('<div class="tool-unlock-notification"></div>');
  $notification.html(`
    <div class="unlock-icon">🎉</div>
    <div class="unlock-title">새로운 도구 해제!</div>
    <div class="unlock-tools">${unlockedTools.join(", ")}</div>
    <div class="unlock-subtitle">이제 사용할 수 있습니다!</div>
  `);

  $("body").append($notification);

  setTimeout(() => {
    $notification.addClass("show");
  }, 100);

  setTimeout(() => {
    $notification.removeClass("show");
    setTimeout(() => {
      $notification.remove();
    }, 500);
  }, 5000);
}

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

  .tool-wrapper.newly-unlocked {
    animation: newlyUnlockedGlow 3s ease-in-out;
  }

  @keyframes newlyUnlockedGlow {
    0%, 100% {
      box-shadow: none;
    }
    50% {
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
    }
  }

  .tool-description.locked {
    border-color: rgba(255, 0, 0, 0.3);
    background: rgba(255, 0, 0, 0.1);
  }

  .tool-description .tool-stats {
    margin-top: 10px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    font-style: italic;
  }

  .tool-description .tool-unlock-condition {
    margin-top: 15px;
    padding: 10px;
    background: rgba(255, 215, 0, 0.2);
    border-radius: 8px;
    color: #FFD700;
    font-weight: bold;
    text-align: center;
  }

  .tool-unlock-notification {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(15px);
    border: 2px solid rgba(255, 215, 0, 0.5);
    border-radius: 20px;
    padding: 30px;
    text-align: center;
    z-index: 10000;
    opacity: 0;
    transition: all 0.5s ease;
    max-width: 400px;
  }

  .tool-unlock-notification.show {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  .tool-unlock-notification .unlock-icon {
    font-size: 60px;
    margin-bottom: 15px;
    animation: bounce 1s ease-in-out infinite;
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translateY(0);
    }
    40%, 43% {
      transform: translateY(-20px);
    }
    70% {
      transform: translateY(-10px);
    }
    90% {
      transform: translateY(-5px);
    }
  }

  .tool-unlock-notification .unlock-title {
    font-size: 24px;
    font-weight: bold;
    color: #FFD700;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  }

  .tool-unlock-notification .unlock-tools {
    font-size: 20px;
    color: #fff;
    margin-bottom: 10px;
    font-weight: 600;
  }

  .tool-unlock-notification .unlock-subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
  }
`
  )
  .appendTo("head");

$(document).on("screen-changed", function (e, screenId) {
  if (screenId === "tool-select") {
    setTimeout(() => {
      if (!window.particlesDisabled) {
        createToolScreenEntrance();
      }
    }, 500);
  } else {
    $(".tool-exclusive").remove();
  }
});

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
