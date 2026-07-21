export function mockDelay(minMs = 1500, maxMs = 3500) {
  const ms = minMs + Math.random() * (maxMs - minMs)
  return new Promise((resolve) => setTimeout(resolve, ms))
}
