import imageCompression from "browser-image-compression";

export const compressImage = async (
  file,
  options = {
    maxSizeMB: 0.1,
    useWebWorker: true, // 압축 속도 개선
  }
) => {
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Error compressing image:", error);
    throw error;
  }
};
