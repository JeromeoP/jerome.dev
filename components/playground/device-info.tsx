"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  addEventListener(type: "chargingchange" | "levelchange", listener: () => void): void;
  removeEventListener(type: "chargingchange" | "levelchange", listener: () => void): void;
}

interface NetworkInformation extends EventTarget {
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: string;
}

interface NavigatorWithExtras extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
  connection?: NetworkInformation;
}

interface DeviceState {
  batteryLevel: number | null;
  batteryCharging: boolean | null;
  online: boolean;
  connection: string | null;
  downlink: number | null;
  gamepadConnected: boolean;
  gamepadName: string | null;
  gamepadButtonsPressed: number;
  vibrateSupported: boolean;
  wakeLockSupported: boolean;
  pointerType: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
}

export function DeviceInfo() {
  const [state, setState] = useState<DeviceState>(() => ({
    batteryLevel: null,
    batteryCharging: null,
    online: true,
    connection: null,
    downlink: null,
    gamepadConnected: false,
    gamepadName: null,
    gamepadButtonsPressed: 0,
    vibrateSupported: false,
    wakeLockSupported: false,
    pointerType: "unknown",
    screenWidth: 0,
    screenHeight: 0,
    devicePixelRatio: 1,
  }));

  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [vibrateFlash, setVibrateFlash] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nav = navigator as NavigatorWithExtras;

    setState((prev) => ({
      ...prev,
      online: navigator.onLine,
      vibrateSupported: "vibrate" in navigator,
      wakeLockSupported: "wakeLock" in navigator,
      pointerType: window.matchMedia("(pointer: fine)").matches
        ? "fine (mouse/trackpad)"
        : window.matchMedia("(pointer: coarse)").matches
          ? "coarse (touch)"
          : "none",
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio,
    }));

    let batteryRef: BatteryManager | null = null;
    function readBattery(b: BatteryManager) {
      setState((prev) => ({
        ...prev,
        batteryLevel: b.level,
        batteryCharging: b.charging,
      }));
    }
    if (nav.getBattery) {
      nav.getBattery().then((b) => {
        batteryRef = b;
        readBattery(b);
        const onChange = () => readBattery(b);
        b.addEventListener("levelchange", onChange);
        b.addEventListener("chargingchange", onChange);
      }).catch(() => {});
    }

    function readConnection() {
      const c = nav.connection;
      if (!c) return;
      setState((prev) => ({
        ...prev,
        connection: c.effectiveType ?? null,
        downlink: c.downlink ?? null,
      }));
    }
    readConnection();
    nav.connection?.addEventListener("change", readConnection);

    function onOnline() {
      setState((prev) => ({ ...prev, online: true }));
    }
    function onOffline() {
      setState((prev) => ({ ...prev, online: false }));
    }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      nav.connection?.removeEventListener("change", readConnection);
      batteryRef?.removeEventListener("levelchange", () => {});
      batteryRef?.removeEventListener("chargingchange", () => {});
    };
  }, []);

  useEffect(() => {
    const nav = navigator as NavigatorWithExtras;
    if (!nav.getGamepads) return;

    function onConnect(e: GamepadEvent) {
      setState((prev) => ({
        ...prev,
        gamepadConnected: true,
        gamepadName: e.gamepad.id,
      }));
    }
    function onDisconnect() {
      setState((prev) => ({
        ...prev,
        gamepadConnected: false,
        gamepadName: null,
        gamepadButtonsPressed: 0,
      }));
    }

    window.addEventListener("gamepadconnected", onConnect);
    window.addEventListener("gamepaddisconnected", onDisconnect);

    let raf = 0;
    function poll() {
      raf = requestAnimationFrame(poll);
      const pads = nav.getGamepads?.() ?? [];
      const active = pads.find((p): p is Gamepad => p !== null);
      if (active) {
        const pressed = active.buttons.filter((b) => b.pressed).length;
        setState((prev) => {
          if (
            prev.gamepadConnected === !!active &&
            prev.gamepadButtonsPressed === pressed
          ) {
            return prev;
          }
          return {
            ...prev,
            gamepadConnected: true,
            gamepadName: active.id,
            gamepadButtonsPressed: pressed,
          };
        });
      }
    }
    poll();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("gamepadconnected", onConnect);
      window.removeEventListener("gamepaddisconnected", onDisconnect);
    };
  }, []);

  const onVibrate = useCallback(() => {
    if (!("vibrate" in navigator)) return;
    navigator.vibrate([30, 30, 30, 30, 120]);
    setVibrateFlash(true);
    setTimeout(() => setVibrateFlash(false), 400);
  }, []);

  const onToggleWakeLock = useCallback(async () => {
    const nav = navigator as NavigatorWithExtras;
    if (!nav.wakeLock) return;
    if (wakeLock && !wakeLock.released) {
      await wakeLock.release();
      setWakeLock(null);
      return;
    }
    try {
      const sentinel = await nav.wakeLock.request("screen");
      sentinel.addEventListener("release", () => setWakeLock(null));
      setWakeLock(sentinel);
    } catch {}
  }, [wakeLock]);

  const rows = useMemo(() => {
    const batterySupported = state.batteryLevel != null;
    const connectionSupported = state.connection != null;
    const downlinkSupported = state.downlink != null;

    return [
      {
        label: "online",
        value: state.online ? "true" : "false",
        bad: !state.online,
      },
      {
        label: "battery",
        value: batterySupported
          ? `${Math.round((state.batteryLevel ?? 0) * 100)}%${
              state.batteryCharging ? " ⚡" : ""
            }`
          : "n/a in this browser",
        unsupported: !batterySupported,
      },
      {
        label: "connection",
        value: connectionSupported ? (state.connection ?? "unknown") : "n/a in this browser",
        unsupported: !connectionSupported,
      },
      {
        label: "downlink",
        value: downlinkSupported ? `${state.downlink} Mb/s` : "n/a in this browser",
        unsupported: !downlinkSupported,
      },
      {
        label: "pointer",
        value: state.pointerType,
      },
      {
        label: "screen",
        value: `${state.screenWidth}×${state.screenHeight} @${state.devicePixelRatio}x`,
      },
      {
        label: "gamepad",
        value: state.gamepadConnected
          ? `${state.gamepadName?.slice(0, 24) ?? "connected"} · ${state.gamepadButtonsPressed} pressed`
          : "plug one in",
      },
    ];
  }, [state]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="overflow-hidden rounded-lg border border-border bg-bg-card">
        <table className="w-full border-collapse font-mono text-xs">
          <tbody>
            {rows.map((row, i) => {
              const isUnsupported =
                "unsupported" in row && row.unsupported === true;
              const isBad = "bad" in row && row.bad === true;
              return (
                <tr
                  key={row.label}
                  className={i > 0 ? "border-t border-border" : ""}
                >
                  <td className="px-3 py-2 uppercase tracking-[0.08em] text-text-muted">
                    {row.label}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={
                        isBad
                          ? "text-rose-500"
                          : isUnsupported
                            ? "italic text-text-muted"
                            : "text-text-primary"
                      }
                    >
                      {row.value}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onVibrate}
          disabled={!state.vibrateSupported}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
            vibrateFlash
              ? "border-accent bg-[color:var(--accent-glow)] text-accent"
              : "border-border text-text-secondary hover:border-accent-light hover:text-accent"
          }`}
        >
          vibrate()
          {!state.vibrateSupported ? (
            <span className="text-[10px] text-text-muted">(unsupported)</span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={onToggleWakeLock}
          disabled={!state.wakeLockSupported}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
            wakeLock && !wakeLock.released
              ? "border-accent bg-[color:var(--accent-glow)] text-accent"
              : "border-border text-text-secondary hover:border-accent-light hover:text-accent"
          }`}
        >
          wakeLock: {wakeLock && !wakeLock.released ? "on" : "off"}
          {!state.wakeLockSupported ? (
            <span className="text-[10px] text-text-muted">(unsupported)</span>
          ) : null}
        </button>
      </div>
      <p className="mt-auto text-[11px] leading-[1.5] text-text-muted">
        Reading this live from{" "}
        <code className="font-mono text-text-secondary">navigator</code>. Some
        APIs need permission, HTTPS, or a specific device — unsupported ones
        just say so.
      </p>
    </div>
  );
}
