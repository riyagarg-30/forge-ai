import { supabaseAdmin } from '../../config/supabaseAdmin.js'

const BUCKET = process.env.BUILD_STUDIO_BUCKET || 'build-studio-assets'

// Pollinations.ai's Flux model is free and requires no API key or signup.
// An optional token (free to request at enter.pollinations.ai) raises the
// anonymous rate limit and removes the watermark, but everything works
// without one.
const POLLINATIONS_BASE_URL = 'https://image.pollinations.ai/prompt'
const POLLINATIONS_TOKEN = process.env.POLLINATIONS_API_TOKEN || ''

// Anonymous Pollinations requests are rate-limited to roughly one request
// every 15 seconds. The orchestrator calls generateAndStoreImage for each
// image job one at a time (not in parallel), and this small buffer keeps
// consecutive calls from tripping that limit.
const MIN_GAP_MS = 16000
let lastRequestAt = 0

async function waitForRateLimit() {
  const elapsed = Date.now() - lastRequestAt
  if (elapsed < MIN_GAP_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_GAP_MS - elapsed))
  }
  lastRequestAt = Date.now()
}

function mapSizeToDimensions(size) {
  // Reuses the same "WxH" strings the rest of the codebase already passes
  // around, so callers didn't need to change when the provider did.
  const [width, height] = (size || '1024x1024').split('x').map(Number)
  return { width: width || 1024, height: height || 1024 }
}

/**
 * Generates one real image via Pollinations' free Flux endpoint and
 * uploads it to the `build-studio-assets` Supabase Storage bucket,
 * returning its public URL. This is the only place Build Studio talks to
 * an image generation API — every asset image in the product flows
 * through here.
 */
export async function generateAndStoreImage({ sessionId, assetKey, sequence = 0, prompt, size = '1536x1024' }) {
  await waitForRateLimit()

  const { width, height } = mapSizeToDimensions(size)
  const params = new URLSearchParams({
    model: 'flux',
    width: String(width),
    height: String(height),
    nologo: 'true',
    safe: 'true',
    // A random seed keeps repeated calls with similar prompts (e.g. the
    // three product-view shots) from returning cached/identical images.
    seed: String(Math.floor(Math.random() * 1_000_000)),
  })
  if (POLLINATIONS_TOKEN) params.set('key', POLLINATIONS_TOKEN)

  const url = `${POLLINATIONS_BASE_URL}/${encodeURIComponent(prompt)}?${params.toString()}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Pollinations image request failed for ${assetKey}#${sequence}: ${response.status} ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  if (buffer.length === 0) {
    throw new Error(`Pollinations returned no image data for ${assetKey}#${sequence}.`)
  }

  const storagePath = `${sessionId}/${assetKey}-${sequence}.png`

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: 'image/png',
      upsert: true,
    })

  if (uploadError) {
    throw new Error(`Failed to upload generated image for ${assetKey}#${sequence}: ${uploadError.message}`)
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath)

  return {
    imageUrl: publicUrlData?.publicUrl || null,
    storagePath,
  }
}
