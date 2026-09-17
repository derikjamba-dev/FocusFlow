const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const duration = 0.5;
const freq = 880;
const amp = 0.3;
const numSamples = Math.floor(sampleRate * duration);
const dataSize = numSamples * 2;

const buffer = Buffer.alloc(44 + dataSize);

buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const envelope = Math.min(1, Math.min(t, duration - t) * 20);
  const sample = Math.sin(2 * Math.PI * freq * t) * amp * envelope;
  buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
}

const out = path.join(__dirname, '..', 'assets', 'beep.wav');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buffer);
console.log('Wrote', out);