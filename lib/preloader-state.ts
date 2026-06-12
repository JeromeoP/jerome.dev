const DONE_EVENT = "jp:preloader-done";

let done = false;

export function isPreloaderDone(): boolean {
  return done;
}

export function markPreloaderDone() {
  if (done) return;
  done = true;
  window.dispatchEvent(new CustomEvent(DONE_EVENT));
}

/** Runs the callback once the preloader finishes (immediately if already done). */
export function onPreloaderDone(callback: () => void): () => void {
  if (done) {
    callback();
    return () => {};
  }
  const handler = () => callback();
  window.addEventListener(DONE_EVENT, handler, { once: true });
  return () => window.removeEventListener(DONE_EVENT, handler);
}
