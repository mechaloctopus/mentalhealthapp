// Generates branded PNG assets (icon, splash, adaptive-icon, favicon) for MoodSignal.
// Pure Node: builds an RGBA buffer, draws gradients + brand mark, encodes a PNG via zlib.
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function crc32(buf) {
  if (typeof zlib.crc32 === 'function') return zlib.crc32(buf) >>> 0;
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  // raw with filter byte 0 per scanline
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- drawing helpers -------------------------------------------------------
function clamp(v) { return v < 0 ? 0 : v > 255 ? 255 : v; }

function makeArt(size, opts = {}) {
  const { showMark = true, markScale = 0.34 } = opts;
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2, cy = size / 2;
  // Mended Light flame palette (violet / blue / indigo) on a deep canvas.
  const bg = [9, 11, 13];
  const teal = [177, 95, 176]; // violet (ring + primary glow)
  const coral = [58, 160, 201]; // brand blue (secondary glow + flame base)
  const lav = [84, 104, 196]; // indigo (accent glow)

  function glow(px, py, base, color, gx, gy, radius, strength) {
    const dx = px - gx, dy = py - gy;
    const d = Math.sqrt(dx * dx + dy * dy) / radius;
    const f = Math.max(0, 1 - d) ** 2 * strength;
    return [
      base[0] + (color[0] - base[0]) * f,
      base[1] + (color[1] - base[1]) * f,
      base[2] + (color[2] - base[2]) * f,
    ];
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // vertical base gradient
      const t = y / size;
      let c = [
        bg[0] + t * 6,
        bg[1] + t * 7,
        bg[2] + t * 6,
      ];
      c = glow(x, y, c, teal, size * 0.20, size * 0.18, size * 0.62, 0.55);
      c = glow(x, y, c, coral, size * 0.86, size * 0.9, size * 0.6, 0.4);
      c = glow(x, y, c, lav, size * 0.9, size * 0.12, size * 0.5, 0.18);

      let a = 255;
      if (showMark) {
        const dx = x - cx, dy = y - cy;
        const r = Math.sqrt(dx * dx + dy * dy);
        const R = size * markScale;
        const ringW = size * 0.05;
        // outer ring (teal)
        const ringD = Math.abs(r - R);
        if (ringD < ringW) {
          const f = 1 - ringD / ringW;
          c = [
            c[0] + (teal[0] - c[0]) * f,
            c[1] + (teal[1] - c[1]) * f,
            c[2] + (teal[2] - c[2]) * f,
          ];
        }
        // inner pulse dot (coral -> amber blend)
        const dotR = size * 0.13;
        if (r < dotR) {
          const f = (1 - r / dotR) * 0.95;
          // bright flame core — violet → blue blend
          const dotCol = [
            (teal[0] + coral[0]) / 2 + 30,
            (teal[1] + coral[1]) / 2 + 20,
            (teal[2] + coral[2]) / 2 + 30,
          ];
          c = [
            c[0] + (dotCol[0] - c[0]) * f,
            c[1] + (dotCol[1] - c[1]) * f,
            c[2] + (dotCol[2] - c[2]) * f,
          ];
        }
      }

      const i = (y * size + x) * 4;
      buf[i] = clamp(c[0]);
      buf[i + 1] = clamp(c[1]);
      buf[i + 2] = clamp(c[2]);
      buf[i + 3] = a;
    }
  }
  return buf;
}

function write(name, size, opts) {
  const art = makeArt(size, opts);
  const png = encodePNG(size, size, art);
  const dir = path.join(__dirname, '..', 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), png);
  console.log('wrote', name, size + 'x' + size, (png.length / 1024).toFixed(1) + 'kb');
}

write('icon.png', 1024, { showMark: true, markScale: 0.30 });
write('adaptive-icon.png', 1024, { showMark: true, markScale: 0.26 });
write('splash.png', 1284, { showMark: true, markScale: 0.16 });
write('favicon.png', 64, { showMark: true, markScale: 0.30 });
console.log('done');
