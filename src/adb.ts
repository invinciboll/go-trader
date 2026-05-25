import type { Adb } from "@yume-chan/adb";

const mergeChunks = (chunks: Uint8Array[]): Uint8Array => {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
};

export const takeScreenshot = async (adb: Adb) => {
  const output = await adb.subprocess.shellProtocol?.spawn("screencap -p");
  if (!output) return null;

  const chunks: Uint8Array[] = [];
  const reader = output.stdout.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const screenshot = mergeChunks(chunks);
  const blob = new Blob([screenshot.buffer as ArrayBuffer], {
    type: "image/png",
  });
  const url = URL.createObjectURL(blob);

  return url;
};

export const tapScreen = async (adb: Adb, x: number, y: number) => {
  await adb.subprocess.shellProtocol?.spawn(`input tap ${x} ${y}`);
};
