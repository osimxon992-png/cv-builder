import { Font } from '@react-pdf/renderer';

// Noto fonts cover Latin (incl. Uzbek ʻ and ʼ) and Cyrillic. Served from /public, so no
// third-party font CDN ever sees the user's IP while they build their CV.
let registered = false;

export function registerFonts(baseUrl) {
  if (registered) return;
  registered = true;
  for (const [family, file] of [['NotoSans', 'NotoSans'], ['NotoSerif', 'NotoSerif']]) {
    Font.register({
      family,
      fonts: [
        { src: `${baseUrl}fonts/${file}-Regular.ttf`, fontWeight: 400 },
        { src: `${baseUrl}fonts/${file}-Bold.ttf`, fontWeight: 700 },
      ],
    });
  }
  // No automatic hyphenation (wrong for uz/ru); only break very long tokens such as URLs.
  Font.registerHyphenationCallback((word) => (word.length > 28 ? word.match(/.{1,20}/g) : [word]));
}
