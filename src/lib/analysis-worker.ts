/// <reference lib="webworker" />

interface NoiseMapMsg { id: number; type: 'noise-map'; pixels: Uint8ClampedArray; width: number; height: number }
interface SobelMsg    { id: number; type: 'sobel';     pixels: Uint8ClampedArray; width: number; height: number }
type InMsg = NoiseMapMsg | SobelMsg

self.onmessage = (e: MessageEvent<InMsg>) => {
  const { id, type, pixels, width, height } = e.data
  if (type === 'noise-map') {
    const result = computeNoiseMap(pixels, width, height)
    self.postMessage({ id, type, result }, [result.buffer])
  } else if (type === 'sobel') {
    const result = computeSobel(pixels, width, height)
    self.postMessage({ id, type, result }, [result.buffer])
  }
}

function computeNoiseMap(d: Uint8ClampedArray, W: number, H: number): Uint8ClampedArray {
  let src = new Float32Array(W * H * 3)
  for (let i = 0; i < W * H; i++) {
    src[i*3] = d[i*4]; src[i*3+1] = d[i*4+1]; src[i*3+2] = d[i*4+2]
  }
  for (let pass = 0; pass < 3; pass++) {
    const blurred = new Float32Array(W * H * 3)
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        let r = 0, g = 0, b = 0, count = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = Math.max(0, Math.min(H-1, y+dy)), nx = Math.max(0, Math.min(W-1, x+dx))
            const idx = (ny*W+nx)*3
            r += src[idx]; g += src[idx+1]; b += src[idx+2]; count++
          }
        }
        const idx = (y*W+x)*3
        blurred[idx] = r/count; blurred[idx+1] = g/count; blurred[idx+2] = b/count
      }
    }
    src = blurred
  }
  const result = new Uint8ClampedArray(d.length)
  const SCALE = 8, OFFSET = 128
  for (let i = 0; i < W*H; i++) {
    result[i*4]   = Math.max(0, Math.min(255, (d[i*4]   - src[i*3])   * SCALE + OFFSET))
    result[i*4+1] = Math.max(0, Math.min(255, (d[i*4+1] - src[i*3+1]) * SCALE + OFFSET))
    result[i*4+2] = Math.max(0, Math.min(255, (d[i*4+2] - src[i*3+2]) * SCALE + OFFSET))
    result[i*4+3] = 255
  }
  return result
}

function computeSobel(d: Uint8ClampedArray, W: number, H: number): Uint8ClampedArray {
  const gray = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++)
    gray[i] = 0.299 * d[i*4] + 0.587 * d[i*4+1] + 0.114 * d[i*4+2]
  const result = new Uint8ClampedArray(d.length)
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const tl = gray[(y-1)*W+x-1], tc = gray[(y-1)*W+x], tr = gray[(y-1)*W+x+1]
      const ml = gray[y*W+x-1],                             mr = gray[y*W+x+1]
      const bl = gray[(y+1)*W+x-1], bc = gray[(y+1)*W+x], br = gray[(y+1)*W+x+1]
      const Gx = -tl - 2*ml - bl + tr + 2*mr + br
      const Gy =  tl + 2*tc + tr - bl - 2*bc - br
      const mag = Math.min(255, Math.sqrt(Gx*Gx + Gy*Gy))
      const idx = (y*W+x)*4
      result[idx] = result[idx+1] = result[idx+2] = mag; result[idx+3] = 255
    }
  }
  return result
}
