// Creates a simple solid-color PNG icon for the app build
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t   = Buffer.from(type);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function solidPNG(w, h, r, g, b) {
  const sig  = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  const row  = Buffer.alloc(1 + w * 3);
  row[0] = 0; // filter = None
  for (let x = 0; x < w; x++) { row[1+x*3]=r; row[2+x*3]=g; row[3+x*3]=b; }
  const rows = Buffer.concat(Array(h).fill(row));
  const idat = zlib.deflateSync(rows, { level: 9 });

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

// Navy blue icon (matches app theme)
const icon = solidPNG(1024, 1024, 37, 99, 235);  // #2563eb
fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), icon);
fs.writeFileSync(path.join(assetsDir, 'splash.png'),
  solidPNG(1284, 2778, 11, 17, 32));  // #0b1120 splash

console.log('✅ Assets created in ./assets/');
