const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
  '[role="menuitemradio"]',
].join(",");

const DEAD_ZONE = 0.2;
const CURSOR_SPEED = 980;
const SCROLL_SPEED = 760;
const CURSOR_HOTSPOT_X = 18;
const CURSOR_HOTSPOT_Y = 3;

type Direction = "left" | "right" | "up" | "down";
type InputMode = "keyboard" | "gamepad";
type GamepadNavigationMethod = "pointer" | "structured";

type RepeatState = {
  nextAt: number;
};

type GamepadWithVibration = Gamepad & {
  vibrationActuator?: {
    playEffect: (
      effect: "dual-rumble",
      options: {
        duration: number;
        startDelay: number;
        strongMagnitude: number;
        weakMagnitude: number;
      },
    ) => Promise<unknown>;
  };
};

let initialized = false;
let activeGamepadIndex: number | null = null;
let previousButtons: boolean[] = [];
let repeatStates = new Map<number, RepeatState>();
let animationFrame = 0;
let previousFrameAt = performance.now();
let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let lastRealPointerX = pointerX;
let lastRealPointerY = pointerY;
let pointerTarget: HTMLElement | null = null;
let pointerElement: HTMLElement | null = null;
let pointerClickTimer: number | null = null;
let gamepadNavigationMethod: GamepadNavigationMethod = "pointer";

const root = document.documentElement;

const isVisible = (element: HTMLElement) => {
  if (element.closest("[inert]")) return false;
  if (element.getAttribute("aria-hidden") === "true") return false;
  if (element instanceof HTMLButtonElement && element.disabled) return false;
  const style = getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    Number(style.opacity) > 0.03 &&
    element.getClientRects().length > 0
  );
};

const getInteractiveAt = (x: number, y: number) => {
  const hit = document.elementFromPoint(x, y);
  const interactive = hit?.closest<HTMLElement>(INTERACTIVE_SELECTOR) ?? null;
  return interactive && isVisible(interactive) ? interactive : null;
};

const dispatchPointerTransition = (
  element: HTMLElement,
  type: "pointerenter" | "pointerleave",
) => {
  const event =
    typeof PointerEvent === "function"
      ? new PointerEvent(type, {
          bubbles: false,
          clientX: pointerX,
          clientY: pointerY,
          pointerType: "mouse",
        })
      : new Event(type, { bubbles: false });
  element.dispatchEvent(event);
};

const setPointerTarget = (
  nextTarget: HTMLElement | null,
  dispatchTransitions = true,
) => {
  if (nextTarget === pointerTarget) return;
  const previousTarget = pointerTarget;
  pointerTarget = nextTarget;

  if (previousTarget) {
    previousTarget.classList.remove("gamepad-pointer-target");
    if (dispatchTransitions) {
      dispatchPointerTransition(previousTarget, "pointerleave");
    }
  }

  if (nextTarget) {
    nextTarget.classList.add("gamepad-pointer-target");
    if (dispatchTransitions) {
      dispatchPointerTransition(nextTarget, "pointerenter");
    }
  }
};

const renderPointer = () => {
  if (!pointerElement) return;
  pointerElement.style.transform = `translate3d(${pointerX - CURSOR_HOTSPOT_X}px, ${pointerY - CURSOR_HOTSPOT_Y}px, 0)`;
};

const updatePointerTarget = (dispatchTransitions = true) => {
  setPointerTarget(getInteractiveAt(pointerX, pointerY), dispatchTransitions);
};

const setPointerPosition = (
  x: number,
  y: number,
  updateTarget = true,
  dispatchTransitions = true,
) => {
  pointerX = Math.max(8, Math.min(window.innerWidth - 8, x));
  pointerY = Math.max(8, Math.min(window.innerHeight - 8, y));
  renderPointer();
  if (updateTarget) updatePointerTarget(dispatchTransitions);
};

const setInputMode = (mode: InputMode) => {
  if (root.dataset.inputMode === mode) return;
  root.dataset.inputMode = mode;
  window.dispatchEvent(
    new CustomEvent("console:input-mode-changed", { detail: { mode } }),
  );
};

const leaveGamepadMode = (nativeX?: number, nativeY?: number) => {
  gamepadNavigationMethod = "pointer";
  const nativeTarget =
    typeof nativeX === "number" && typeof nativeY === "number"
      ? getInteractiveAt(nativeX, nativeY)
      : null;
  if (nativeTarget === pointerTarget) {
    setPointerTarget(null, false);
  } else {
    setPointerTarget(null);
  }
  setInputMode("keyboard");
};

const useGamepadMode = () => {
  if (root.dataset.inputMode !== "gamepad") {
    setPointerPosition(lastRealPointerX, lastRealPointerY, false);
    setInputMode("gamepad");
    updatePointerTarget();
  }
};

const applyDeadZone = (value = 0) => {
  const absolute = Math.abs(value);
  if (absolute <= DEAD_ZONE) return 0;
  const normalized = (absolute - DEAD_ZONE) / (1 - DEAD_ZONE);
  return Math.sign(value) * normalized ** 1.45;
};

const getGamepads = () =>
  Array.from(navigator.getGamepads?.() ?? []).filter(
    (gamepad): gamepad is Gamepad => Boolean(gamepad),
  );

const updateConnectionState = (gamepads = getGamepads()) => {
  const connected = gamepads.length > 0;
  root.dataset.gamepadConnected = String(connected);
  if (!connected && root.dataset.inputMode === "gamepad") {
    leaveGamepadMode();
  }
};

const vibrate = (gamepad: Gamepad, strength = 0.16) => {
  const actuator = (gamepad as GamepadWithVibration).vibrationActuator;
  if (!actuator) return;
  void actuator
    .playEffect("dual-rumble", {
      duration: 42,
      startDelay: 0,
      strongMagnitude: strength * 0.55,
      weakMagnitude: strength,
    })
    .catch(() => undefined);
};

const flashPointerClick = () => {
  if (!pointerElement) return;
  pointerElement.dataset.clicking = "true";
  if (pointerClickTimer !== null) window.clearTimeout(pointerClickTimer);
  pointerClickTimer = window.setTimeout(() => {
    pointerElement?.removeAttribute("data-clicking");
    pointerClickTimer = null;
  }, 180);
};

const focusAndPointTo = (
  element: HTMLElement,
  suppressPointerSound = false,
) => {
  element.scrollIntoView({ block: "nearest", inline: "nearest" });
  const bounds = element.getBoundingClientRect();
  if (suppressPointerSound) root.dataset.gamepadNavigating = "true";
  setPointerPosition(
    bounds.left + bounds.width / 2,
    bounds.top + bounds.height / 2,
  );
  if (suppressPointerSound) delete root.dataset.gamepadNavigating;
  element.focus({ preventScroll: true });
};

const getNavigationCandidates = () => {
  const openDialog = document.querySelector<HTMLDialogElement>("dialog[open]");
  const openLanguageSwitcher = document.querySelector<HTMLElement>(
    '[data-language-switcher][data-open="true"]',
  );
  const scope: ParentNode = openDialog ?? openLanguageSwitcher ?? document;
  return Array.from(scope.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR))
    .filter(isVisible)
    .filter((element, index, all) => all.indexOf(element) === index);
};

const moveSpatialFocus = (direction: Direction) => {
  const candidates = getNavigationCandidates();
  if (!candidates.length) return false;

  const activeElement =
    document.activeElement instanceof HTMLElement
      ? document.activeElement.closest<HTMLElement>(INTERACTIVE_SELECTOR)
      : null;
  const current =
    (pointerTarget && candidates.includes(pointerTarget)
      ? pointerTarget
      : activeElement && candidates.includes(activeElement)
        ? activeElement
        : null) ?? null;

  if (!current) {
    const nearest = candidates
      .map((candidate) => {
        const bounds = candidate.getBoundingClientRect();
        const x = bounds.left + bounds.width / 2;
        const y = bounds.top + bounds.height / 2;
        return {
          candidate,
          distance: Math.hypot(x - pointerX, y - pointerY),
        };
      })
      .sort((a, b) => a.distance - b.distance)[0]?.candidate;
    if (!nearest) return false;
    focusAndPointTo(nearest, true);
    window.consoleAudio?.play("navigate");
    return true;
  }

  const currentBounds = current.getBoundingClientRect();
  const currentX = currentBounds.left + currentBounds.width / 2;
  const currentY = currentBounds.top + currentBounds.height / 2;
  const horizontal = direction === "left" || direction === "right";
  const directionSign = direction === "left" || direction === "up" ? -1 : 1;

  const next = candidates
    .filter((candidate) => candidate !== current)
    .map((candidate) => {
      const bounds = candidate.getBoundingClientRect();
      const x = bounds.left + bounds.width / 2;
      const y = bounds.top + bounds.height / 2;
      const primary = horizontal ? x - currentX : y - currentY;
      const secondary = horizontal ? y - currentY : x - currentX;
      const inDirection = primary * directionSign > 4;
      const alignmentPenalty = Math.abs(secondary) * 0.42;
      const distance = Math.hypot(primary, secondary);
      return {
        candidate,
        inDirection,
        score: Math.abs(primary) + alignmentPenalty + distance * 0.12,
      };
    })
    .filter((entry) => entry.inDirection)
    .sort((a, b) => a.score - b.score)[0]?.candidate;

  if (!next) {
    window.consoleAudio?.play("error");
    return false;
  }
  focusAndPointTo(next, true);
  window.consoleAudio?.play("navigate");
  return true;
};

const getReadyStartup = () => {
  const startup = document.querySelector<HTMLElement>("[data-startup-screen]");
  return startup &&
    startup.dataset.phase === "ready" &&
    startup.getAttribute("aria-hidden") !== "true"
    ? startup
    : null;
};

const getOpenLanguageSwitcher = () =>
  document.querySelector<HTMLElement>(
    '[data-language-switcher][data-open="true"]',
  );

const pointToCurrentCarouselItem = () => {
  window.requestAnimationFrame(() => {
    const current = getReadyStartup()
      ? document.querySelector<HTMLElement>(
          '[data-startup-profile][data-carousel-position="active"]',
        )
      : document.querySelector<HTMLElement>(
          '[data-music-disc][data-carousel-position="active"]',
        );
    if (!current) return;
    const musicStage = current.matches("[data-music-disc]")
      ? current.closest<HTMLElement>(".music-carousel__stage")
      : null;
    const bounds = (musicStage ?? current).getBoundingClientRect();
    setPointerPosition(
      bounds.left + bounds.width / 2,
      bounds.top + bounds.height / 2,
      false,
    );
    setPointerTarget(current, false);
    current.focus({ preventScroll: true });
  });
};

const handleDirection = (direction: Direction) => {
  useGamepadMode();
  gamepadNavigationMethod = "structured";
  const openDialog = document.querySelector<HTMLDialogElement>("dialog[open]");
  if (openDialog || getOpenLanguageSwitcher()) {
    moveSpatialFocus(direction);
    return;
  }

  const startup = getReadyStartup();
  if (startup && (direction === "left" || direction === "right")) {
    const arrow = startup.querySelector<HTMLButtonElement>(
      direction === "left" ? "[data-profile-previous]" : "[data-profile-next]",
    );
    arrow?.click();
    pointToCurrentCarouselItem();
    return;
  }

  if (
    root.dataset.consoleView === "music" &&
    (direction === "left" || direction === "right")
  ) {
    const arrow = document.querySelector<HTMLButtonElement>(
      direction === "left"
        ? '[data-music-arrow="previous"]'
        : '[data-music-arrow="next"]',
    );
    if (!arrow || arrow.disabled) {
      window.consoleAudio?.play("error");
      return;
    }
    window.consoleAudio?.play("navigate");
    arrow.click();
    pointToCurrentCarouselItem();
    return;
  }

  moveSpatialFocus(direction);
};

const activateCurrentTarget = (gamepad: Gamepad) => {
  useGamepadMode();
  if (gamepadNavigationMethod === "pointer") updatePointerTarget();
  const activeElement =
    document.activeElement instanceof HTMLElement
      ? document.activeElement.closest<HTMLElement>(INTERACTIVE_SELECTOR)
      : null;
  let target = pointerTarget && isVisible(pointerTarget) ? pointerTarget : null;
  if (!target && activeElement && isVisible(activeElement))
    target = activeElement;
  if (
    root.dataset.consoleView === "music" &&
    gamepadNavigationMethod === "structured" &&
    (!target || target.matches("[data-music-arrow], [data-music-disc]"))
  ) {
    target = document.querySelector<HTMLButtonElement>(
      '[data-music-disc][data-carousel-position="active"]',
    );
  }
  if (!target && getReadyStartup()) {
    target = document.querySelector<HTMLButtonElement>("[data-start-console]");
  }
  if (!target) {
    window.consoleAudio?.play("error");
    vibrate(gamepad, 0.1);
    return;
  }
  target.focus({ preventScroll: true });
  flashPointerClick();
  vibrate(gamepad);
  target.click();
};

const closeLanguageSwitcher = () => {
  const switcher = getOpenLanguageSwitcher();
  if (!switcher) return false;
  switcher.dataset.open = "false";
  const toggle = switcher.querySelector<HTMLButtonElement>(
    "[data-language-toggle]",
  );
  toggle?.setAttribute("aria-expanded", "false");
  if (toggle) focusAndPointTo(toggle, true);
  window.consoleAudio?.play("back");
  return true;
};

const navigateBack = (gamepad: Gamepad) => {
  useGamepadMode();
  if (closeLanguageSwitcher()) {
    vibrate(gamepad, 0.1);
    return;
  }
  const dialog = document.querySelector<HTMLDialogElement>("dialog[open]");
  if (dialog) {
    dialog.querySelector<HTMLButtonElement>("[data-contact-close]")?.click();
    vibrate(gamepad, 0.1);
    return;
  }
  if (getReadyStartup()) {
    document.querySelector<HTMLButtonElement>("[data-skip-startup]")?.click();
    vibrate(gamepad, 0.1);
    return;
  }
  const backButton = document.querySelector<HTMLButtonElement>(
    '[data-console-back]:not([aria-hidden="true"])',
  );
  if (backButton) {
    backButton.click();
    vibrate(gamepad, 0.1);
    return;
  }
  if (window.history.length > 1) {
    window.history.back();
    vibrate(gamepad, 0.1);
    return;
  }
  window.consoleAudio?.play("error");
};

const openProfileMenu = (gamepad: Gamepad) => {
  useGamepadMode();
  if (getReadyStartup()) return;
  const profileButton = document.querySelector<HTMLButtonElement>(
    "[data-replay-startup]",
  );
  if (!profileButton) {
    window.location.assign(new URL("/#menu", window.location.origin));
    return;
  }
  profileButton.click();
  vibrate(gamepad, 0.12);
  window.setTimeout(() => {
    const startButton = document.querySelector<HTMLButtonElement>(
      "[data-start-console]",
    );
    if (startButton) focusAndPointTo(startButton);
  }, 60);
};

const toggleControl = (selector: string, gamepad: Gamepad, strength = 0.11) => {
  useGamepadMode();
  const control = document.querySelector<HTMLButtonElement>(selector);
  if (!control || control.hidden || control.disabled) return;
  control.click();
  vibrate(gamepad, strength);
};

const handleButtonPress = (
  index: number,
  gamepad: Gamepad,
  repeated = false,
) => {
  useGamepadMode();
  if (root.dataset.launching === "true") return;
  switch (index) {
    case 0:
      if (!repeated) activateCurrentTarget(gamepad);
      break;
    case 1:
    case 8:
      if (!repeated) navigateBack(gamepad);
      break;
    case 2:
      if (!repeated) toggleControl("[data-sound-toggle]", gamepad);
      break;
    case 3:
      if (!repeated) toggleControl("[data-theme-toggle]", gamepad);
      break;
    case 4:
      handleDirection("left");
      break;
    case 5:
      handleDirection("right");
      break;
    case 9:
      if (!repeated) openProfileMenu(gamepad);
      break;
    case 10:
      if (!repeated)
        setPointerPosition(window.innerWidth / 2, window.innerHeight / 2);
      break;
    case 11:
      if (!repeated) toggleControl("[data-fullscreen-toggle]", gamepad, 0.16);
      break;
    case 12:
      handleDirection("up");
      break;
    case 13:
      handleDirection("down");
      break;
    case 14:
      handleDirection("left");
      break;
    case 15:
      handleDirection("right");
      break;
  }
};

const processRepeatButton = (
  index: number,
  pressed: boolean,
  wasPressed: boolean,
  now: number,
  gamepad: Gamepad,
) => {
  if (!pressed) {
    repeatStates.delete(index);
    return;
  }
  if (!wasPressed) {
    handleButtonPress(index, gamepad);
    repeatStates.set(index, { nextAt: now + 420 });
    return;
  }
  const repeatState = repeatStates.get(index);
  if (repeatState && now >= repeatState.nextAt) {
    handleButtonPress(index, gamepad, true);
    repeatState.nextAt = now + 125;
  }
};

const pollGamepad = (now: number) => {
  const gamepads = getGamepads();
  updateConnectionState(gamepads);
  const gamepad =
    (activeGamepadIndex === null
      ? null
      : gamepads.find((item) => item.index === activeGamepadIndex)) ??
    gamepads.find((item) => item.mapping === "standard") ??
    gamepads[0];

  const elapsedSeconds = Math.min(0.05, (now - previousFrameAt) / 1000);
  previousFrameAt = now;
  if (!gamepad) {
    activeGamepadIndex = null;
    previousButtons = [];
    repeatStates.clear();
    animationFrame = window.requestAnimationFrame(pollGamepad);
    return;
  }

  if (activeGamepadIndex !== gamepad.index) {
    activeGamepadIndex = gamepad.index;
    previousButtons = gamepad.buttons.map(() => false);
    repeatStates.clear();
  }

  const leftX = applyDeadZone(gamepad.axes[0]);
  const leftY = applyDeadZone(gamepad.axes[1]);
  const rightX = applyDeadZone(gamepad.axes[2]);
  const rightY = applyDeadZone(gamepad.axes[3]);
  const hasStickInput =
    Math.abs(leftX) > 0 ||
    Math.abs(leftY) > 0 ||
    Math.abs(rightX) > 0 ||
    Math.abs(rightY) > 0;

  if (hasStickInput) useGamepadMode();
  if (
    root.dataset.inputMode === "gamepad" &&
    root.dataset.cursorHidden !== "true" &&
    root.dataset.launching !== "true" &&
    (leftX !== 0 || leftY !== 0)
  ) {
    gamepadNavigationMethod = "pointer";
    setPointerPosition(
      pointerX + leftX * CURSOR_SPEED * elapsedSeconds,
      pointerY + leftY * CURSOR_SPEED * elapsedSeconds,
    );
  }
  if (rightX !== 0 || rightY !== 0) {
    window.scrollBy({
      left: rightX * SCROLL_SPEED * elapsedSeconds,
      top: rightY * SCROLL_SPEED * elapsedSeconds,
      behavior: "auto",
    });
  }

  gamepad.buttons.forEach((button, index) => {
    const wasPressed = previousButtons[index] ?? false;
    const repeatable = [4, 5, 12, 13, 14, 15].includes(index);
    if (repeatable) {
      processRepeatButton(index, button.pressed, wasPressed, now, gamepad);
    } else if (button.pressed && !wasPressed) {
      handleButtonPress(index, gamepad);
    }
  });
  previousButtons = gamepad.buttons.map((button) => button.pressed);
  animationFrame = window.requestAnimationFrame(pollGamepad);
};

const createPointer = () => {
  const element = document.createElement("div");
  element.className = "gamepad-pointer";
  element.dataset.gamepadPointer = "true";
  element.setAttribute("aria-hidden", "true");
  element.innerHTML =
    '<span class="gamepad-pointer__pulse"></span><img src="/cursor-hand.svg" alt="" width="54" height="54">';
  document.body.append(element);
  pointerElement = element;
  renderPointer();

  const syncPointerLayer = () => {
    if (!pointerElement) return;
    const openDialog =
      document.querySelector<HTMLDialogElement>("dialog[open]");
    const host = openDialog ?? document.body;
    if (pointerElement.parentElement !== host) host.append(pointerElement);
  };
  const dialogObserver = new MutationObserver(syncPointerLayer);
  document.querySelectorAll("dialog").forEach((dialog) =>
    dialogObserver.observe(dialog, {
      attributes: true,
      attributeFilter: ["open"],
    }),
  );
};

export const initializeConsoleGamepad = () => {
  if (initialized) return;
  initialized = true;
  root.dataset.inputMode = root.dataset.inputMode ?? "keyboard";
  createPointer();
  updateConnectionState();

  window.addEventListener("gamepadconnected", () => updateConnectionState());
  window.addEventListener("gamepaddisconnected", () => updateConnectionState());
  window.addEventListener("resize", () => {
    setPointerPosition(pointerX, pointerY);
  });
  window.addEventListener("pagehide", () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  });
  window.addEventListener("pageshow", () => {
    if (animationFrame) return;
    previousFrameAt = performance.now();
    animationFrame = window.requestAnimationFrame(pollGamepad);
  });

  document.addEventListener(
    "pointermove",
    (event) => {
      if (!event.isTrusted) return;
      lastRealPointerX = event.clientX;
      lastRealPointerY = event.clientY;
      if (root.dataset.inputMode === "gamepad") {
        leaveGamepadMode(event.clientX, event.clientY);
      }
    },
    { passive: true },
  );
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (!event.isTrusted) return;
      lastRealPointerX = event.clientX;
      lastRealPointerY = event.clientY;
      if (root.dataset.inputMode === "gamepad") {
        leaveGamepadMode(event.clientX, event.clientY);
      } else {
        setInputMode("keyboard");
      }
    },
    { capture: true, passive: true },
  );
  document.addEventListener(
    "keydown",
    (event) => {
      if (!event.isTrusted) return;
      if (root.dataset.inputMode === "gamepad") leaveGamepadMode();
      else setInputMode("keyboard");
    },
    true,
  );

  previousFrameAt = performance.now();
  animationFrame = window.requestAnimationFrame(pollGamepad);
};
