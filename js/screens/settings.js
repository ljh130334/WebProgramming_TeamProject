let audioSettings = {
  bgmVolume: 50,
  sfxVolume: 70,
  particlesEnabled: true,
  animationsEnabled: true,
};

// 설정 시스템 초기화
function initSettingsSystem() {
  const $optionsBtn = $("#options-btn");
  const $settingsPanel = $("#settings-panel");
  const $settingsClose = $("#settings-close");
  const $mainBgm = $("#main-bgm");

  // 설정 로드
  loadSettings();

  // 옵션 버튼 클릭
  $optionsBtn.on("click", function () {
    if ($settingsPanel.is(":visible")) {
      hideSettings();
    } else {
      showSettings();
    }
  });

  // 설정 닫기 버튼
  $settingsClose.on("click", function () {
    hideSettings();
  });

  // 배경음악 볼륨 조절
  $("#main-volume-range").on("input", function () {
    const volume = $(this).val();
    audioSettings.bgmVolume = volume;
    $mainBgm[0].volume = volume / 100;
    $("#volume-display").text(volume + "%");
    saveSettings();

    // 볼륨 변경 시 파티클 효과
    if (audioSettings.particlesEnabled) {
      createVolumeChangeEffect($(this));
    }
  });

  // 파티클 효과 토글
  $("#particles-toggle").on("change", function () {
    audioSettings.particlesEnabled = $(this).is(":checked");
    saveSettings();

    if (!audioSettings.particlesEnabled) {
      // 파티클 효과 비활성화
      $(".fire-particle, .falling-ingredients, .chef-hat").remove();
      showNotification("파티클 효과가 비활성화되었습니다.");
      // 새로운 파티클 생성 중단
      window.particlesDisabled = true;
    } else {
      // 파티클 효과 활성화
      window.particlesDisabled = false;
      showNotification("파티클 효과가 활성화되었습니다! ✨");
    }

    console.log(
      "파티클 효과:",
      audioSettings.particlesEnabled ? "활성화" : "비활성화"
    );
  });

  // 애니메이션 토글
  $("#animations-toggle").on("change", function () {
    audioSettings.animationsEnabled = $(this).is(":checked");
    saveSettings();

    // CSS 애니메이션 제어
    if (audioSettings.animationsEnabled) {
      $("body").removeClass("no-animations");
      showNotification("애니메이션이 활성화되었습니다! 🎬");
    } else {
      $("body").addClass("no-animations");
      showNotification("애니메이션이 비활성화되었습니다.");
    }

    console.log(
      "애니메이션:",
      audioSettings.animationsEnabled ? "활성화" : "비활성화"
    );
  });

  // 설정 초기화
  $("#settings-reset").on("click", function () {
    if (confirm("모든 설정을 초기값으로 되돌리시겠습니까?")) {
      resetSettings();
      showNotification("설정이 초기화되었습니다! 🔄");
    }
  });

  // 배경음악 자동 재생 시도
  setupAutoMusic();
}

function showSettings() {
  $("#settings-panel").slideDown(300);
}

function hideSettings() {
  $("#settings-panel").slideUp(300);
  $("#options-btn").html("⚙️ 옵션 ⚙️");
}

function loadSettings() {
  // 로컬 스토리지에서 설정 로드
  const saved = localStorage.getItem("audioSettings");
  if (saved) {
    audioSettings = { ...audioSettings, ...JSON.parse(saved) };
  }

  // UI에 설정 적용
  $("#main-volume-range").val(audioSettings.bgmVolume);
  $("#volume-display").text(audioSettings.bgmVolume + "%");
  $("#sfx-volume-range").val(audioSettings.sfxVolume);
  $("#sfx-display").text(audioSettings.sfxVolume + "%");
  $("#particles-toggle").prop("checked", audioSettings.particlesEnabled);
  $("#animations-toggle").prop("checked", audioSettings.animationsEnabled);

  // 배경음악 볼륨 적용
  const $mainBgm = $("#main-bgm");
  if ($mainBgm.length) {
    $mainBgm[0].volume = audioSettings.bgmVolume / 100;
  }

  // 애니메이션 설정 적용
  if (!audioSettings.animationsEnabled) {
    $("body").addClass("no-animations");
  }

  // 파티클 설정 적용
  if (!audioSettings.particlesEnabled) {
    window.particlesDisabled = true;
  }
}

function saveSettings() {
  localStorage.setItem("audioSettings", JSON.stringify(audioSettings));
}

function resetSettings() {
  localStorage.removeItem("audioSettings");

  audioSettings = {
    bgmVolume: 50,
    sfxVolume: 70,
    particlesEnabled: true,
    animationsEnabled: true,
  };

  $("#main-volume-range").val(audioSettings.bgmVolume);
  $("#volume-display").text(audioSettings.bgmVolume + "%");
  $("#sfx-volume-range").val(audioSettings.sfxVolume);
  $("#sfx-display").text(audioSettings.sfxVolume + "%");
  $("#particles-toggle").prop("checked", audioSettings.particlesEnabled);
  $("#animations-toggle").prop("checked", audioSettings.animationsEnabled);

  const $mainBgm = $("#main-bgm");
  if ($mainBgm.length) {
    $mainBgm[0].volume = audioSettings.bgmVolume / 100;
  }

  $("body").removeClass("no-animations");
  window.particlesDisabled = false;

  $(".fire-particle, .falling-ingredients, .chef-hat").remove();

  saveSettings();

  console.log("설정이 완전히 초기화되었습니다:", audioSettings);
}

// 볼륨 변경 시 시각적 효과
function createVolumeChangeEffect($slider) {
  const rect = $slider[0].getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  for (let i = 0; i < 5; i++) {
    const $particle = $("<div></div>");
    $particle.css({
      position: "fixed",
      left: x + "px",
      top: y + "px",
      width: "6px",
      height: "6px",
      background: "#ff6b35",
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: 9999,
    });

    $("body").append($particle);

    $particle.animate(
      {
        left: x + (Math.random() - 0.5) * 50 + "px",
        top: y + (Math.random() - 0.5) * 50 + "px",
        opacity: 0,
      },
      800,
      function () {
        $(this).remove();
      }
    );
  }
}

// 자동 배경음악 설정
function setupAutoMusic() {
  const $mainBgm = $("#main-bgm");

  function tryPlayMusic() {
    $mainBgm[0]
      .play()
      .then(() => {
        console.log("배경음악이 시작되었습니다 🎵");
        $(window).off("mousemove click keydown touchstart", tryPlayMusic);
      })
      .catch((error) => {
        // 사용자 상호작용 필요
      });
  }

  // 사용자 상호작용 시 음악 재생 시도
  $(window).on("mousemove click keydown touchstart", tryPlayMusic);
}

// 알림 표시 함수
function showNotification(message) {
  const $notification = $('<div class="settings-notification"></div>');
  $notification.text(message);

  $("body").append($notification);

  // 슬라이드 인
  setTimeout(() => {
    $notification.css("transform", "translateX(0)");
  }, 100);

  // 3초 후 제거
  setTimeout(() => {
    $notification.css("transform", "translateX(100%)");
    setTimeout(() => {
      $notification.remove();
    }, 300);
  }, 3000);
}

// 파티클 시스템과 연동하기 위한 전역 변수
window.particlesDisabled = false;

// settings.js에서 SFX 볼륨을 가져오는 함수 (게임에서 사용)
function getSfxVolume() {
  return audioSettings.sfxVolume / 100;
}

// settings.js에서 BGM 볼륨을 가져오는 함수 (게임에서 사용)
function getBgmVolume() {
  return audioSettings.bgmVolume / 100;
}
