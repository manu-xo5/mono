import { clsx, type ClassValue } from "clsx";
import { filter } from "rxjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getScreenCaptureStream() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });

    return stream;
  } catch (err) {
    console.debug(err);
    return null;
  }
}

export function addListener(target: EventTarget, type: string, handler: <T>(event: T) => any, options?: AddEventListenerOptions): () => void {
  target.addEventListener(type, handler, options);

  return () => {
    target.removeEventListener(type, handler);
  };
}

export function createPeerId(displayName: string) {
  return "share-easyi" + crypto.randomUUID() + displayName;
}
export function getDisplayNameFromPeerId(peerId: string) {
  const prefixLen = "share-easyi".length + 36;
  return peerId.substring(prefixLen);
}

export const ofType = <T, const Value extends T>(y: Value) => filter<T, Value>((x): x is Value => x === y);
