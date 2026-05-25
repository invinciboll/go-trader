import cv from "@techstark/opencv-js";

const urlToMat = (url: string): Promise<cv.Mat> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      resolve(cv.imread(canvas));
    };
    img.onerror = reject;
    img.src = url;
  });
};

export type MatchResult = {
  score: number;
  location: { x: number; y: number };
  width: number;
  height: number;
};

export async function findButtonInScreenshot(
  screenshotUrl: string,
  buttonUrl: string,
): Promise<MatchResult> {
  const src = await urlToMat(screenshotUrl);
  const tpl = await urlToMat(buttonUrl);

  const result = new cv.Mat();
  cv.matchTemplate(src, tpl, result, cv.TM_CCOEFF_NORMED);

  const minMax = (cv as any).minMaxLoc(result); //any cast to avoid ts/wasm mismatch warning
  const tplWidth = tpl.cols;
  const tplHeight = tpl.rows;

  src.delete();
  tpl.delete();
  result.delete();

  return {
    score: minMax.maxVal,
    location: minMax.maxLoc,
    width: tplWidth,
    height: tplHeight,
  };
}

export async function drawMatchOnScreenshot(
  screenshotUrl: string,
  match: MatchResult,
  accept: boolean,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      ctx.strokeStyle = accept ? "lime" : "red";
      ctx.lineWidth = 12;
      ctx.strokeRect(
        match.location.x,
        match.location.y,
        match.width,
        match.height,
      );

      const label = accept ? "best match": "no match"; ;
      const fontSize = 48;
      ctx.font = `bold ${fontSize}px sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const padding = 4;
      const labelX = match.location.x;
      const labelY = match.location.y - 8;

      ctx.fillStyle = accept ? "lime" : "red";
      ctx.fillRect(
        labelX,
        labelY - fontSize,
        textWidth + padding * 2,
        fontSize + padding,
      );

      ctx.fillStyle = accept ? "black" : "white";
      ctx.fillText(label, labelX + padding, labelY - 2);

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = screenshotUrl;
  });
}
