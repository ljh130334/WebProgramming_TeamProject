class GameStateManager {
  constructor() {
    this.timers = new Set(); // 모든 타이머 추적
    this.intervals = new Set(); // 모든 인터벌 추적
    this.eventListeners = new Map(); // 이벤트 리스너 추적
    this.currentScreen = "main";
    this.gameState = {
      selectedSide: null,
      selectedTool: null,
      selectedDifficulty: null,
      currentStage: 1,
      unlockedTools: ["Wok", "Knife"],
      settings: {
        bgmVolume: 50,
        sfxVolume: 70,
        particlesEnabled: true,
        animationsEnabled: true,
      },
    };
  }

  // 타이머 관리
  addTimer(timerId) {
    this.timers.add(timerId);
    return timerId;
  }

  addInterval(intervalId) {
    this.intervals.add(intervalId);
    return intervalId;
  }

  // 모든 타이머/인터벌 정리
  clearAllTimers() {
    this.timers.forEach((id) => clearTimeout(id));
    this.intervals.forEach((id) => clearInterval(id));
    this.timers.clear();
    this.intervals.clear();
  }

  // 이벤트 리스너 관리
  addEventListener(element, event, handler, identifier) {
    const key = `${identifier}_${event}`;
    if (this.eventListeners.has(key)) {
      // 기존 리스너 제거
      const oldHandler = this.eventListeners.get(key);
      $(element).off(event, oldHandler);
    }

    $(element).on(event, handler);
    this.eventListeners.set(key, handler);
  }

  // 특정 화면의 이벤트 리스너 정리
  clearScreenEventListeners(screenId) {
    this.eventListeners.forEach((handler, key) => {
      if (key.startsWith(screenId)) {
        // 해당 화면의 이벤트 리스너 제거 로직
        this.eventListeners.delete(key);
      }
    });
  }

  // 화면 전환
  switchScreen(newScreen) {
    const oldScreen = this.currentScreen;

    // 이전 화면 정리
    this.cleanupScreen(oldScreen);

    // 새 화면 설정
    this.currentScreen = newScreen;
    this.initializeScreen(newScreen);

    // 이벤트 발생
    $(document).trigger("screen-changed", [newScreen]);
  }

  cleanupScreen(screenId) {
    // 해당 화면의 타이머들 정리
    this.clearAllTimers();

    // 해당 화면의 이벤트 리스너 정리
    this.clearScreenEventListeners(screenId);

    // 화면별 전용 파티클 정리
    $(`.${screenId}-exclusive`).remove();
  }

  initializeScreen(screenId) {
    // 화면별 초기화 로직
    switch (screenId) {
      case "main":
        this.initMainScreen();
        break;
      case "game":
        this.initGameScreen();
        break;
      // 기타 화면들...
    }
  }

  // 안전한 타이머 생성
  safeSetTimeout(callback, delay) {
    const id = setTimeout(() => {
      callback();
      this.timers.delete(id);
    }, delay);
    return this.addTimer(id);
  }

  safeSetInterval(callback, interval) {
    const id = setInterval(callback, interval);
    return this.addInterval(id);
  }

  // 게임 데이터 저장/로드
  saveGameData() {
    localStorage.setItem("gameState", JSON.stringify(this.gameState));
  }

  loadGameData() {
    const saved = localStorage.getItem("gameState");
    if (saved) {
      this.gameState = { ...this.gameState, ...JSON.parse(saved) };
    }
  }

  // 설정 관리
  updateSetting(key, value) {
    this.gameState.settings[key] = value;
    this.saveGameData();

    // 설정 변경 이벤트 발생
    $(document).trigger("setting-changed", [key, value]);
  }
}

// 전역 인스턴스 생성
window.gameStateManager = new GameStateManager();

// jQuery ready에서 초기화
$(document).ready(function () {
  window.gameStateManager.loadGameData();
});
