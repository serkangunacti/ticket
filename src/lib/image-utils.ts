type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = src;
  });
}

export async function trimImageDataUrl(
  src: string,
  padding = 12,
): Promise<string> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    return src;
  }

  context.drawImage(image, 0, 0);
  const { data, width, height } = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  );

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha <= 8) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < 0 || maxY < 0) {
    return src;
  }

  const safeMinX = clamp(minX - padding, 0, width);
  const safeMinY = clamp(minY - padding, 0, height);
  const safeMaxX = clamp(maxX + padding, 0, width - 1);
  const safeMaxY = clamp(maxY + padding, 0, height - 1);
  const cropWidth = Math.max(1, safeMaxX - safeMinX + 1);
  const cropHeight = Math.max(1, safeMaxY - safeMinY + 1);

  if (cropWidth === width && cropHeight === height) {
    return src;
  }

  const trimmedCanvas = document.createElement("canvas");
  trimmedCanvas.width = cropWidth;
  trimmedCanvas.height = cropHeight;
  const trimmedContext = trimmedCanvas.getContext("2d");

  if (!trimmedContext) {
    return src;
  }

  trimmedContext.drawImage(
    canvas,
    safeMinX,
    safeMinY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight,
  );

  return trimmedCanvas.toDataURL("image/png", 0.92);
}

export async function getCroppedSquareDataUrl(
  src: string,
  cropArea: CropArea,
  outputSize: number,
  backgroundColor: string,
): Promise<string> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const context = canvas.getContext("2d");

  if (!context) {
    return src;
  }

  const sourceX = clamp(Math.round(cropArea.x), 0, image.naturalWidth - 1);
  const sourceY = clamp(Math.round(cropArea.y), 0, image.naturalHeight - 1);
  const sourceWidth = clamp(
    Math.round(cropArea.width),
    1,
    image.naturalWidth - sourceX,
  );
  const sourceHeight = clamp(
    Math.round(cropArea.height),
    1,
    image.naturalHeight - sourceY,
  );

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, outputSize, outputSize);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    outputSize,
    outputSize,
  );

  return canvas.toDataURL("image/png", 0.92);
}