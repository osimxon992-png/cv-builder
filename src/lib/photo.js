const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_SIDE = 400;

/**
 * Converts an uploaded image to a small JPEG data URL (fits LocalStorage, works in react-pdf).
 * Throws Error('photoType' | 'photoSize' | 'photoRead').
 */
export function readPhoto(file) {
  if (!file || !ACCEPTED.includes(file.type)) return Promise.reject(new Error('photoType'));
  if (file.size > MAX_BYTES) return Promise.reject(new Error('photoSize'));
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff'; // transparent PNGs would turn black in JPEG
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('photoRead'));
    };
    img.src = url;
  });
}
