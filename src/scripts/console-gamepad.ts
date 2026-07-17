const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
  '[role="menuitemradio"]',
  '[data-startup-profile][data-carousel-position="active"]',
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
let lastControllerAudioAttemptAt = Number.NEGATIVE_INFINITY;

const root = document.documentElement;

const isVisible = (element: HTMLElement) => {
  if (element.closest("[inert]")) return false;
  if (element.closest('[aria-hidden="true"]')) return false;
  if (element instanceof HTMLButtonElement && element.disabled) return false;
  let current: HTMLElement | null = element;
  while (current) {
    const style = getComputedStyle(current);
    if (
      current.hidden ||
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.visibility === "collapse" ||
      Number(style.opacity) <= 0.03
    ) {
      return false;
    }
    current = current.parentElement;
  }
  return element.getClientRects().length > 0;
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
  const focused = document.activeElement;
  if (
    focused instanceof HTMLElement &&
    !focused.matches('input, textarea, select, [contenteditable="true"]')
  ) {
    focused.blur();
  }
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
  const now = performance.now();
  if (
    !window.consoleAudio?.getMusicState().playing &&
    now - lastControllerAudioAttemptAt > 800
  ) {
    lastControllerAudioAttemptAt = now;
    window.consoleAudio?.startMusic();
  }
  if (root.dataset.inputMode !== "gamepad") {
    setPointerPosition(lastRealPointerX, lastRealPointerY, false);
    setInputMode("gamepad");
    updatePointerTarget();
  }
};

const usePointerNavigation = () => {
  if (gamepadNavigationMethod === "structured") {
    const focused = document.activeElement;
    if (focused instanceof HTMLElement) focused.blur();
  }
  gamepadNavigationMethod = "pointer";
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

const dispatchControllerClick = (element: HTMLElement) => {
  element.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
      detail: 1,
      button: 0,
      clientX: pointerX,
      clientY: pointerY,
    }),
  );
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

const getScopedNavigationCandidates = (scope: ParentNode | null) =>
  scope
    ? Array.from(scope.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR))
        .filter(isVisible)
        .filter((element, index, all) => all.indexOf(element) === index)
    : [];

const getCurrentNavigationTarget = () => {
  if (pointerTarget && isVisible(pointerTarget)) return pointerTarget;
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return null;
  const interactive = active.closest<HTMLElement>(INTERACTIVE_SELECTOR);
  return interactive && isVisible(interactive) ? interactive : null;
};

const getElementCenter = (element: HTMLElement) => {
  const bounds = element.getBoundingClientRect();
  return {
    x: bounds.left + bounds.width / 2,
    y: bounds.top + bounds.height / 2,
    height: bounds.height,
  };
};

const playNavigationBoundary = (repeated = false) => {
  if (!repeated) window.consoleAudio?.play("boundary");
};

const focusNavigationTarget = (element: HTMLElement) => {
  focusAndPointTo(element, true);
  window.consoleAudio?.play("navigate");
};

const getHeaderNavigationCandidates = () =>
  getScopedNavigationCandidates(
    document.querySelector<HTMLElement>(".console-topbar"),
  );

const getFooterNavigationCandidates = () =>
  getScopedNavigationCandidates(
    document.querySelector<HTMLElement>(".console-bottombar"),
  );

const moveLinearFocus = (
  candidates: HTMLElement[],
  direction: "left" | "right",
  repeated = false,
) => {
  const ordered = [...candidates].sort(
    (first, second) => getElementCenter(first).x - getElementCenter(second).x,
  );
  if (!ordered.length) return false;
  const current = getCurrentNavigationTarget();
  const currentIndex = current ? ordered.indexOf(current) : -1;
  if (currentIndex < 0) {
    const nearest = ordered
      .map((candidate) => ({
        candidate,
        distance: Math.abs(getElementCenter(candidate).x - pointerX),
      }))
      .sort((first, second) => first.distance - second.distance)[0]?.candidate;
    if (!nearest) return false;
    focusNavigationTarget(nearest);
    return true;
  }
  const nextIndex = currentIndex + (direction === "left" ? -1 : 1);
  const next = ordered[nextIndex];
  if (!next) {
    playNavigationBoundary(repeated);
    return false;
  }
  focusNavigationTarget(next);
  return true;
};

const focusNearestByX = (
  candidates: HTMLElement[],
  preferredX = pointerX,
  repeated = false,
) => {
  const nearest = candidates
    .map((candidate) => ({
      candidate,
      distance: Math.abs(getElementCenter(candidate).x - preferredX),
    }))
    .sort((first, second) => first.distance - second.distance)[0]?.candidate;
  if (!nearest) {
    playNavigationBoundary(repeated);
    return false;
  }
  focusNavigationTarget(nearest);
  return true;
};

const getEdgeRow = (candidates: HTMLElement[], edge: "top" | "bottom") => {
  if (!candidates.length) return [];
  const entries = candidates.map((candidate) => ({
    candidate,
    ...getElementCenter(candidate),
  }));
  const edgeY =
    edge === "top"
      ? Math.min(...entries.map((entry) => entry.y))
      : Math.max(...entries.map((entry) => entry.y));
  const tolerance = Math.max(
    24,
    entries.reduce((sum, entry) => sum + entry.height, 0) / entries.length / 2,
  );
  return entries
    .filter((entry) => Math.abs(entry.y - edgeY) <= tolerance)
    .map((entry) => entry.candidate);
};

const moveGridFocus = (
  candidates: HTMLElement[],
  direction: Direction,
  repeated = false,
  announceBoundary = true,
) => {
  if (!candidates.length) return false;
  const entries = candidates
    .map((candidate) => ({ candidate, ...getElementCenter(candidate) }))
    .sort((first, second) => first.y - second.y || first.x - second.x);
  const rows: Array<{
    y: number;
    height: number;
    items: typeof entries;
  }> = [];

  entries.forEach((entry) => {
    const currentRow = rows.at(-1);
    const tolerance = Math.max(
      24,
      Math.min(entry.height, currentRow?.height ?? entry.height) / 2,
    );
    if (!currentRow || Math.abs(entry.y - currentRow.y) > tolerance) {
      rows.push({ y: entry.y, height: entry.height, items: [entry] });
      return;
    }
    currentRow.items.push(entry);
    currentRow.y =
      currentRow.items.reduce((sum, item) => sum + item.y, 0) /
      currentRow.items.length;
    currentRow.height = Math.max(currentRow.height, entry.height);
  });
  rows.forEach((row) => row.items.sort((a, b) => a.x - b.x));

  const current = getCurrentNavigationTarget();
  const currentRowIndex = rows.findIndex((row) =>
    row.items.some((item) => item.candidate === current),
  );
  if (currentRowIndex < 0) {
    const nearest = entries
      .map((entry) => ({
        candidate: entry.candidate,
        distance: Math.hypot(entry.x - pointerX, entry.y - pointerY),
      }))
      .sort((first, second) => first.distance - second.distance)[0]?.candidate;
    if (!nearest) return false;
    focusNavigationTarget(nearest);
    return true;
  }

  const currentRow = rows[currentRowIndex];
  const currentItemIndex = currentRow.items.findIndex(
    (item) => item.candidate === current,
  );
  const currentItem = currentRow.items[currentItemIndex];
  let next: HTMLElement | undefined;

  if (direction === "left" || direction === "right") {
    const nextIndex = currentItemIndex + (direction === "left" ? -1 : 1);
    next = currentRow.items[nextIndex]?.candidate;
  } else {
    const nextRowIndex = currentRowIndex + (direction === "up" ? -1 : 1);
    const nextRow = rows[nextRowIndex];
    next = nextRow?.items
      .map((item) => ({
        candidate: item.candidate,
        distance: Math.abs(item.x - currentItem.x),
      }))
      .sort((first, second) => first.distance - second.distance)[0]?.candidate;
  }

  if (!next) {
    if (announceBoundary) playNavigationBoundary(repeated);
    return false;
  }
  focusNavigationTarget(next);
  return true;
};

const moveSpatialFocus = (
  direction: Direction,
  candidates = getNavigationCandidates(),
  repeated = false,
  announceBoundary = true,
) => {
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
    if (announceBoundary) playNavigationBoundary(repeated);
    return false;
  }
  focusAndPointTo(next, true);
  window.consoleAudio?.play("navigate");
  return true;
};

const getGalleryNavigationCandidates = () =>
  Array.from(
    document.querySelectorAll<HTMLElement>("[data-channel-link]"),
  ).filter(isVisible);

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

const handleStartupDirection = (
  startup: HTMLElement,
  direction: Direction,
  repeated: boolean,
) => {
  const current = getCurrentNavigationTarget();
  const topControls = getScopedNavigationCandidates(startup).filter((item) =>
    item.matches("[data-language-toggle], [data-skip-startup]"),
  );
  const activeProfile = startup.querySelector<HTMLElement>(
    '[data-startup-profile][data-carousel-position="active"]',
  );
  const startButton = startup.querySelector<HTMLButtonElement>(
    "[data-start-console]",
  );
  const currentIsTopControl = Boolean(current && topControls.includes(current));

  if (direction === "left" || direction === "right") {
    if (currentIsTopControl) {
      moveLinearFocus(topControls, direction, repeated);
      return;
    }
    const arrow = startup.querySelector<HTMLButtonElement>(
      direction === "left" ? "[data-profile-previous]" : "[data-profile-next]",
    );
    if (!arrow) {
      playNavigationBoundary(repeated);
      return;
    }
    arrow.click();
    pointToCurrentCarouselItem();
    return;
  }

  if (currentIsTopControl) {
    if (direction === "down" && activeProfile) {
      focusNavigationTarget(activeProfile);
    } else {
      playNavigationBoundary(repeated);
    }
    return;
  }

  if (current === startButton) {
    if (direction === "up" && activeProfile) {
      focusNavigationTarget(activeProfile);
    } else {
      playNavigationBoundary(repeated);
    }
    return;
  }

  if (direction === "up") {
    focusNearestByX(topControls, pointerX, repeated);
    return;
  }

  if (startButton && isVisible(startButton)) {
    focusNavigationTarget(startButton);
  } else {
    playNavigationBoundary(repeated);
  }
};

const handleMusicDirection = (direction: Direction, repeated: boolean) => {
  const current = getCurrentNavigationTarget();
  const headerControls = getHeaderNavigationCandidates();
  const footerControls = getFooterNavigationCandidates();
  const actionControls = getScopedNavigationCandidates(
    document.querySelector<HTMLElement>(".music-channel__actions"),
  );
  const activeDisc = document.querySelector<HTMLElement>(
    '[data-music-disc][data-carousel-position="active"]',
  );
  const currentIsHeader = Boolean(current?.closest(".console-topbar"));
  const currentIsFooter = Boolean(current?.closest(".console-bottombar"));
  const currentIsAction = Boolean(current && actionControls.includes(current));
  const currentIsDisc = Boolean(
    current?.matches("[data-music-disc], [data-music-arrow]"),
  );

  if (currentIsHeader) {
    if (direction === "left" || direction === "right") {
      moveLinearFocus(headerControls, direction, repeated);
    } else if (direction === "down" && activeDisc) {
      focusNavigationTarget(activeDisc);
    } else {
      playNavigationBoundary(repeated);
    }
    return;
  }

  if (currentIsFooter) {
    if (direction === "left" || direction === "right") {
      moveLinearFocus(footerControls, direction, repeated);
    } else if (direction === "up") {
      focusNearestByX(actionControls, pointerX, repeated);
    } else {
      playNavigationBoundary(repeated);
    }
    return;
  }

  if (currentIsAction) {
    if (direction === "left" || direction === "right") {
      moveLinearFocus(actionControls, direction, repeated);
    } else if (direction === "up" && activeDisc) {
      focusNavigationTarget(activeDisc);
    } else if (direction === "down") {
      focusNearestByX(footerControls, pointerX, repeated);
    } else {
      playNavigationBoundary(repeated);
    }
    return;
  }

  if (currentIsDisc || !current) {
    if (direction === "left" || direction === "right") {
      const arrow = document.querySelector<HTMLButtonElement>(
        direction === "left"
          ? '[data-music-arrow="previous"]'
          : '[data-music-arrow="next"]',
      );
      if (!arrow || arrow.disabled) {
        playNavigationBoundary(repeated);
        return;
      }
      window.consoleAudio?.play("navigate");
      arrow.click();
      pointToCurrentCarouselItem();
    } else if (direction === "up") {
      focusNearestByX(headerControls, pointerX, repeated);
    } else {
      const playButton =
        document.querySelector<HTMLElement>("[data-music-play]");
      if (playButton && isVisible(playButton)) {
        focusNavigationTarget(playButton);
      } else {
        playNavigationBoundary(repeated);
      }
    }
    return;
  }

  if (activeDisc) {
    focusNavigationTarget(activeDisc);
  } else {
    playNavigationBoundary(repeated);
  }
};

const handleGalleryDirection = (direction: Direction, repeated: boolean) => {
  const current = getCurrentNavigationTarget();
  const headerControls = getHeaderNavigationCandidates();
  const footerControls = getFooterNavigationCandidates();
  const galleryControls = getGalleryNavigationCandidates();
  const currentIsHeader = Boolean(current?.closest(".console-topbar"));
  const currentIsFooter = Boolean(current?.closest(".console-bottombar"));

  if (currentIsHeader) {
    if (direction === "left" || direction === "right") {
      moveLinearFocus(headerControls, direction, repeated);
    } else if (direction === "down") {
      focusNearestByX(getEdgeRow(galleryControls, "top"), pointerX, repeated);
    } else {
      playNavigationBoundary(repeated);
    }
    return;
  }

  if (currentIsFooter) {
    if (direction === "left" || direction === "right") {
      moveLinearFocus(footerControls, direction, repeated);
    } else if (direction === "up") {
      focusNearestByX(
        getEdgeRow(galleryControls, "bottom"),
        pointerX,
        repeated,
      );
    } else {
      playNavigationBoundary(repeated);
    }
    return;
  }

  const moved = moveGridFocus(galleryControls, direction, repeated, false);
  if (moved) return;
  if (direction === "up") {
    focusNearestByX(headerControls, pointerX, repeated);
  } else if (direction === "down") {
    focusNearestByX(footerControls, pointerX, repeated);
  } else {
    playNavigationBoundary(repeated);
  }
};

const handlePageChromeDirection = (direction: Direction, repeated: boolean) => {
  const current = getCurrentNavigationTarget();
  const headerControls = getHeaderNavigationCandidates();
  const footerControls = getFooterNavigationCandidates();
  if (current?.closest(".console-topbar")) {
    if (direction === "left" || direction === "right") {
      moveLinearFocus(headerControls, direction, repeated);
    } else if (direction === "down") {
      focusNearestByX(footerControls, pointerX, repeated);
    } else {
      playNavigationBoundary(repeated);
    }
    return;
  }
  if (current?.closest(".console-bottombar")) {
    if (direction === "left" || direction === "right") {
      moveLinearFocus(footerControls, direction, repeated);
    } else if (direction === "up") {
      focusNearestByX(headerControls, pointerX, repeated);
    } else {
      playNavigationBoundary(repeated);
    }
    return;
  }
  moveSpatialFocus(direction, getNavigationCandidates(), repeated);
};

const handleDirection = (direction: Direction, repeated = false) => {
  useGamepadMode();
  gamepadNavigationMethod = "structured";
  const openDialog = document.querySelector<HTMLDialogElement>("dialog[open]");
  if (openDialog || getOpenLanguageSwitcher()) {
    moveSpatialFocus(direction, getNavigationCandidates(), repeated);
    return;
  }

  const startup = getReadyStartup();
  if (startup) {
    handleStartupDirection(startup, direction, repeated);
    return;
  }

  if (root.dataset.consoleView === "music") {
    handleMusicDirection(direction, repeated);
    return;
  }

  if (root.dataset.consoleView === "gallery") {
    handleGalleryDirection(direction, repeated);
    return;
  }

  handlePageChromeDirection(direction, repeated);
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
  if (getReadyStartup() && target?.matches("[data-startup-profile]")) {
    target = document.querySelector<HTMLButtonElement>("[data-start-console]");
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
  dispatchControllerClick(target);
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
      handleDirection("left", repeated);
      break;
    case 5:
      handleDirection("right", repeated);
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
      handleDirection("up", repeated);
      break;
    case 13:
      handleDirection("down", repeated);
      break;
    case 14:
      handleDirection("left", repeated);
      break;
    case 15:
      handleDirection("right", repeated);
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
    usePointerNavigation();
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
  window.addEventListener("console:view-changed", (event) => {
    const view = (event as CustomEvent<{ view?: string }>).detail?.view;
    if (view !== "music" || root.dataset.inputMode !== "gamepad") return;
    gamepadNavigationMethod = "structured";
    pointToCurrentCarouselItem();
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
