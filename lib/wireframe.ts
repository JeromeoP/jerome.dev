const WIREFRAME_EVENT = "jp:wireframe";

export function isWireframe(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("wireframe");
}

export function toggleWireframe(): boolean {
  const enabled = document.documentElement.classList.toggle("wireframe");
  window.dispatchEvent(
    new CustomEvent(WIREFRAME_EVENT, { detail: { enabled } }),
  );
  return enabled;
}

export function onWireframeChange(
  callback: (enabled: boolean) => void,
): () => void {
  const handler = (e: Event) => {
    callback((e as CustomEvent<{ enabled: boolean }>).detail.enabled);
  };
  window.addEventListener(WIREFRAME_EVENT, handler);
  return () => window.removeEventListener(WIREFRAME_EVENT, handler);
}
