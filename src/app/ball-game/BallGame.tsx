"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./BallGame.module.scss";

type GameMode = "idle" | "spinning" | "result";

type Ball = {
  id: number;
  number: number;
};

type BallConfig = {
  ball: Ball;
  baseX: number;
  baseY: number;
  radiusX: number;
  radiusY: number;
  phase: number;
  speed: number;
  wobble: number;
  drift: number;
};

type BallMotion = {
  ball: Ball;
  x: number;
  y: number;
  angle: number;
  scale: number;
  zIndex: number;
  opacity: number;
  layer: "window" | "launch";
  glow: number;
};

const BALLS: Ball[] = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  number: index + 1,
}));

const BALL_CONFIGS: BallConfig[] = BALLS.map((ball, index) => ({
  ball,
  baseX: [18, 31, 44, 58, 71, 24, 38, 52, 66, 48][index],
  baseY: [76, 77, 78, 77, 76, 66, 67, 66, 67, 57][index],
  radiusX: 24 + (index % 3) * 5.5,
  radiusY: 14 + (index % 4) * 3,
  phase: index * 0.74 + (index % 2 ? 0.22 : -0.18),
  speed: 1.8 + (index % 5) * 0.18,
  wobble: 4.4 + (index % 4) * 0.85,
  drift: 4 + (index % 3) * 1.1,
}));

const SPIN_DURATION_MS = 1280;
const LAUNCH_DURATION_MS = 980;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function mix(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3;
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - ((-2 * value + 2) ** 3) / 2;
}

function quadraticPoint(
  from: { x: number; y: number },
  control: { x: number; y: number },
  to: { x: number; y: number },
  t: number
) {
  const x = (1 - t) ** 2 * from.x + 2 * (1 - t) * t * control.x + t ** 2 * to.x;
  const y = (1 - t) ** 2 * from.y + 2 * (1 - t) * t * control.y + t ** 2 * to.y;

  return { x, y };
}

function createWindowMotion(config: BallConfig, time: number, mode: GameMode, activeBallId: number | null): BallMotion {
  const idleBob = Math.sin(time * 1.4 + config.phase) * 0.9;
  const idleSway = Math.cos(time * 1.2 + config.phase * 1.3) * 0.75;
  const isActive = config.ball.id === activeBallId;

  if (mode === "idle") {
    const y = config.baseY + idleBob;

    return {
      ball: config.ball,
      x: config.baseX + idleSway,
      y,
      angle: Math.sin(time * 1.5 + config.phase) * 5,
      scale: 1 + (isActive ? 0.04 : 0),
      zIndex: 2 + Math.round(y / 10),
      opacity: 1,
      layer: "window",
      glow: 0.08,
    };
  }

  if (mode === "result" && isActive) {
    return {
      ball: config.ball,
      x: config.baseX,
      y: config.baseY,
      angle: 0,
      scale: 1,
      zIndex: 0,
      opacity: 0,
      layer: "window",
      glow: 0,
    };
  }

  if (mode === "result") {
    const settle = 0.68 + Math.sin(time * 1.1 + config.phase) * 0.32;
    const x = mix(config.baseX, 48 + Math.sin(config.phase) * 12, settle * 0.22);
    const y = mix(config.baseY, Math.min(79, config.baseY + 2.4), 0.55);

    return {
      ball: config.ball,
      x,
      y,
      angle: Math.sin(time * 1.1 + config.phase) * 4,
      scale: 1,
      zIndex: 2 + Math.round(y / 10),
      opacity: 1,
      layer: "window",
      glow: 0.1,
    };
  }

  const orbit = time * config.speed + config.phase;
  const swirl = Math.sin(time * 4.2 + config.phase * 0.7);
  const x =
    50 +
    Math.cos(orbit) * config.radiusX +
    Math.sin(orbit * 2.1 + config.phase) * config.drift +
    Math.cos(time * 2.7 + config.phase) * 3.4;
  const y =
    49 +
    Math.sin(orbit * 1.18) * config.radiusY +
    Math.cos(orbit * 2.45 - config.phase) * config.wobble +
    Math.abs(Math.sin(orbit * 0.8)) * 13.5;

  return {
    ball: config.ball,
    x,
    y,
    angle: Math.sin(orbit * 2.8) * 24 + swirl * 4,
    scale: isActive ? 1.12 + Math.sin(time * 8.4) * 0.04 : 0.98 + Math.abs(swirl) * 0.08,
    zIndex: isActive ? 60 : 10 + Math.round(y),
    opacity: 1,
    layer: "window",
    glow: isActive ? 0.42 : 0.14,
  };
}

function createLaunchMotion(config: BallConfig, progress: number): BallMotion {
  const firstLeg = clamp(progress / 0.46, 0, 1);
  const secondLeg = clamp((progress - 0.46) / 0.54, 0, 1);

  const from = { x: 35, y: 60 };
  const throat = quadraticPoint(from, { x: 28, y: 70 }, { x: 24, y: 78 }, easeInOutCubic(firstLeg));
  const exit = quadraticPoint({ x: 24, y: 78 }, { x: 17, y: 83 }, { x: 9.5, y: 88 }, easeOutCubic(secondLeg));
  const point = progress < 0.46 ? throat : exit;
  const burst = progress > 0.46 ? (progress - 0.46) / 0.54 : 0;

  return {
    ball: config.ball,
    x: point.x,
    y: point.y,
    angle: mix(-18, 10, easeOutCubic(progress)),
    scale: mix(1.02, 1.16, Math.sin(Math.min(progress, 1) * Math.PI)) + burst * 0.08,
    zIndex: 90,
    opacity: 1,
    layer: "launch",
    glow: 0.32 + burst * 0.38,
  };
}

export function BallGame() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<GameMode>("idle");
  const [result, setResult] = useState<number | null>(null);
  const [activeBallId, setActiveBallId] = useState<number | null>(null);
  const [ballMotions, setBallMotions] = useState<BallMotion[]>(() =>
    BALL_CONFIGS.map((config) => createWindowMotion(config, 0, "idle", null))
  );

  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const openedAtRef = useRef(0);
  const resultStartedAtRef = useRef(0);
  const modeRef = useRef<GameMode>("idle");
  const activeBallIdRef = useRef<number | null>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    activeBallIdRef.current = activeBallId;
  }, [activeBallId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    openedAtRef.current = performance.now();

    const update = (now: number) => {
      const elapsed = (now - openedAtRef.current) / 1000;
      const currentMode = modeRef.current;
      const currentActiveBallId = activeBallIdRef.current;
      const launchProgress =
        currentMode === "result" ? clamp((now - resultStartedAtRef.current) / LAUNCH_DURATION_MS, 0, 1) : 0;

      setBallMotions(
        BALL_CONFIGS.map((config) => {
          if (currentMode === "result" && config.ball.id === currentActiveBallId) {
            return createLaunchMotion(config, launchProgress);
          }

          return createWindowMotion(config, elapsed, currentMode, currentActiveBallId);
        })
      );

      rafRef.current = window.requestAnimationFrame(update);
    };

    rafRef.current = window.requestAnimationFrame(update);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  function clearTimer() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function resetGameState(nextOpen: boolean) {
    setOpen(nextOpen);
    setMode("idle");
    setResult(null);
    setActiveBallId(null);
    modeRef.current = "idle";
    activeBallIdRef.current = null;
    resultStartedAtRef.current = 0;
  }

  function handleOpen() {
    clearTimer();
    resetGameState(true);
  }

  function handleClose() {
    clearTimer();
    resetGameState(false);
  }

  function handleStart() {
    clearTimer();

    const picked = BALLS[Math.floor(Math.random() * BALLS.length)];
    setMode("spinning");
    setResult(null);
    setActiveBallId(picked.id);
    modeRef.current = "spinning";
    activeBallIdRef.current = picked.id;

    timerRef.current = window.setTimeout(() => {
      resultStartedAtRef.current = performance.now();
      setMode("result");
      setResult(picked.number);
      modeRef.current = "result";
      timerRef.current = null;
    }, SPIN_DURATION_MS);
  }

  const windowBalls = ballMotions.filter((motion) => motion.layer === "window" && motion.opacity > 0.01);
  const launchBall = ballMotions.find((motion) => motion.layer === "launch");

  return (
    <>
      <button className={styles.trigger} type="button" onClick={handleOpen} aria-label="打开透明摇球机小游戏">
        <span className={styles.triggerIcon} aria-hidden="true">
          ●
        </span>
        <span className={styles.triggerText}>摇球机</span>
      </button>

      {open ? (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="透明摇球机小游戏">
          <div className={styles.card}>
            <button className={styles.closeButton} type="button" onClick={handleClose} aria-label="关闭小游戏">
              ×
            </button>

            <div className={styles.machineWrap}>
              <div className={styles.machineBase} />
              <div className={styles.machineStand} />
              <div className={styles.machineShell}>
                <div className={styles.shellTop} />
                <div className={styles.shellChute} />
                <div className={styles.shellSpark} />
                <div className={styles.shellHub} />
                <div className={`${styles.shellArms} ${mode === "spinning" ? styles.shellArmsSpinning : ""}`}>
                  <span />
                  <span />
                  <span />
                </div>
                <div className={styles.shellWindow}>
                  {windowBalls.map(({ ball, x, y, angle, scale, zIndex, glow }) => (
                    <span
                      key={ball.id}
                      className={`${styles.ball} ${ball.id === activeBallId ? styles.ballActive : ""}`}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: `translate(-50%, -50%) rotate(${angle}deg) scale(${scale})`,
                        zIndex,
                        boxShadow: `0 10px 18px rgba(194, 138, 39, 0.22), 0 0 ${16 + glow * 26}px rgba(255, 224, 123, ${0.18 + glow * 0.26})`,
                      }}
                    >
                      {ball.number}
                    </span>
                  ))}
                </div>
                <div className={styles.shellTray} />
              </div>

              <div className={styles.machineSpout}>
                <div className={styles.spoutSocket} />
                <div className={styles.spoutBody}>
                  <div className={styles.spoutInner} />
                  <div className={styles.spoutLip} />
                  <div className={`${styles.spoutFlash} ${mode === "result" ? styles.spoutFlashVisible : ""}`} />
                </div>
              </div>

              <div className={styles.machineRail}>
                <span className={styles.machineRailBar} />
                <span className={styles.machineRailBar} />
              </div>

              {launchBall ? (
                <span
                  className={`${styles.ball} ${styles.ballLaunch}`}
                  style={{
                    left: `${launchBall.x}%`,
                    top: `${launchBall.y}%`,
                    transform: `translate(-50%, -50%) rotate(${launchBall.angle}deg) scale(${launchBall.scale})`,
                    zIndex: launchBall.zIndex,
                    boxShadow: `0 12px 20px rgba(194, 138, 39, 0.3), 0 0 ${22 + launchBall.glow * 22}px rgba(255, 224, 123, ${0.3 + launchBall.glow * 0.2})`,
                  }}
                >
                  {launchBall.ball.number}
                </span>
              ) : null}
            </div>

            <div className={styles.content}>
              <p className={styles.title}>透明摇球机</p>
              <p className={styles.description}>
                机器里有 10 个黄色球，编号 1 到 10。
                <br />
                点击开始，摇出这次的幸运球。
              </p>
              <button className={styles.action} type="button" onClick={handleStart} disabled={mode === "spinning"}>
                {mode === "spinning" ? "摇一摇中..." : "开始摇球"}
              </button>
              {mode === "result" && result ? <p className={styles.result}>本次摇出：{result} 号球</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
