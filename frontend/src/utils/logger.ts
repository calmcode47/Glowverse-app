type Level = "debug" | "info" | "warn" | "error";

let enabled = true;
let levelOrder: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
let currentLevel: Level = __DEV__ ? "debug" : "info";
const errors: { message: string; time: number }[] = [];

export function setEnabled(v: boolean) {
  enabled = v;
}

export function setLevel(l: Level) {
  currentLevel = l;
}

export function log(l: Level, ...args: any[]) {
  if (!enabled) return;
  if (levelOrder[l] < levelOrder[currentLevel]) return;
  const tag = `[${l.toUpperCase()}]`;
  if (l === "error") {
    errors.push({ message: String(args[0]), time: Date.now() });
  }
  if (l === "debug" && !__DEV__) return;
  // eslint-disable-next-line no-console
  console.log(tag, ...args);
}

export function getErrors() {
  return errors.slice(-50);
}

export function timeStart(label: string) {
  return { label, start: Date.now() };
}

export function timeEnd(t: { label: string; start: number }) {
  const duration = Date.now() - t.start;
  log("debug", `${t.label} took ${duration}ms`);
  return duration;
}
