// Cloudinary Upload Route - Server-side secure upload
// All Cloudinary credentials stay server-side (never exposed to frontend)

import { Hono } from 'hono'
import { verifyToken } from '../utils/auth'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  CLOUDINARY_CLOUD_NAME: string
  CLOUDINARY_API_KEY: string
  CLOUDINARY_API_SECRET: string
}

export const uploadRoutes = new Hono<{ Bindings: Bindings }>()

// Helper: generate Cloudinary signature (uses SHA-1 as per Cloudinary docs)
async function generateCloudinarySignature(
  params: Record<string, string>,
  apiSecret: string
): Promise<string> {
  // Sort params alphabetically and build the string to sign
  const sortedKeys = Object.keys(params).sort()
  const stringToSign = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + apiSecret

  const encoder = new TextEncoder()
  const data = encoder.encode(stringToSign)
  // Cloudinary uses SHA-1 for signature by default
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Helper: upload image to Cloudinary via REST API
async function uploadToCloudinary(
  imageData: string | ArrayBuffer,
  folder: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  publicId?: string,
  mimeType?: string
): Promise<{ url: string; public_id: string; width: number; height: number }> {
  const timestamp = String(Math.floor(Date.now() / 1000))
  
  const params: Record<string, string> = {
    folder,
    timestamp,
    ...(publicId ? { public_id: publicId } : {}),
  }

  const signature = await generateCloudinarySignature(params, apiSecret)
  
  const formData = new FormData()
  
  // imageData can be base64 string or ArrayBuffer
  if (typeof imageData === 'string') {
    // base64 data URI or base64 string
    formData.append('file', imageData)
  } else {
    // ArrayBuffer - wrap in Blob with proper MIME type
    const mime = mimeType || 'image/jpeg'
    const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
    const blob = new Blob([imageData], { type: mime })
    formData.append('file', blob, `upload.${ext}`)
  }
  
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp)
  formData.append('folder', folder)
  formData.append('signature', signature)
  if (publicId) formData.append('public_id', publicId)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    let errText = ''
    try { errText = await response.text() } catch {}
    throw new Error(`Cloudinary upload failed (${response.status}): ${errText}`)
  }

  const result = await response.json() as any
  if (result.error) {
    throw new Error(`Cloudinary error: ${result.error.message || JSON.stringify(result.error)}`)
  }
  return {
    url: result.secure_url,
    public_id: result.public_id,
    width: result.width || 0,
    height: result.height || 0,
  }
}

// ==================== UPLOAD PROFILE IMAGE ====================
// POST /api/upload/profile-image
// Requires: Authorization header with user JWT token
// Body: multipart/form-data with 'image' field OR JSON with base64 'data' field
uploadRoutes.post('/profile-image', async (c) => {
  const auth = c.req.header('Authorization')
  if (!auth) return c.json({ error: 'Authentication required' }, 401)

  try {
    const token = auth.replace('Bearer ', '')
    const payload = await verifyToken(token, c.env.JWT_SECRET || 'donghua-secret-key-2024')

    const cloudName = c.env.CLOUDINARY_CLOUD_NAME
    const apiKey = c.env.CLOUDINARY_API_KEY
    const apiSecret = c.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return c.json({ error: 'Image upload service not configured. Please contact admin.' }, 503)
    }

    const contentType = c.req.header('Content-Type') || ''
    let imageData: string | ArrayBuffer

    if (contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData()
      const file = formData.get('image') as File | null
      if (!file) return c.json({ error: 'No image file provided' }, 400)
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return c.json({ error: 'Only image files are allowed' }, 400)
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return c.json({ error: 'Image must be smaller than 5MB' }, 400)
      }
      imageData = await file.arrayBuffer()
    } else {
      // JSON with base64
      const body = await c.req.json()
      if (!body.data) return c.json({ error: 'No image data provided' }, 400)
      imageData = body.data // base64 data URI
    }

    const folder = 'donghualand/profiles'
    const publicId = `user_${payload.id}_profile`

    const result = await uploadToCloudinary(
      imageData, folder, cloudName, apiKey, apiSecret, publicId
    )

    // Update user profile_image in DB
    await c.env.DB.prepare(
      'UPDATE users SET profile_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(result.url, payload.id).run()

    return c.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ==================== UPLOAD COVER IMAGE ====================
// POST /api/upload/cover-image
uploadRoutes.post('/cover-image', async (c) => {
  const auth = c.req.header('Authorization')
  if (!auth) return c.json({ error: 'Authentication required' }, 401)

  try {
    const token = auth.replace('Bearer ', '')
    const payload = await verifyToken(token, c.env.JWT_SECRET || 'donghua-secret-key-2024')

    const cloudName = c.env.CLOUDINARY_CLOUD_NAME
    const apiKey = c.env.CLOUDINARY_API_KEY
    const apiSecret = c.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return c.json({ error: 'Image upload service not configured. Please contact admin.' }, 503)
    }

    const contentType = c.req.header('Content-Type') || ''
    let imageData: string | ArrayBuffer

    if (contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData()
      const file = formData.get('image') as File | null
      if (!file) return c.json({ error: 'No image file provided' }, 400)
      if (!file.type.startsWith('image/')) return c.json({ error: 'Only image files are allowed' }, 400)
      if (file.size > 10 * 1024 * 1024) return c.json({ error: 'Image must be smaller than 10MB' }, 400)
      imageData = await file.arrayBuffer()
    } else {
      const body = await c.req.json()
      if (!body.data) return c.json({ error: 'No image data provided' }, 400)
      imageData = body.data
    }

    const folder = 'donghualand/covers'
    const publicId = `user_${payload.id}_cover`

    const result = await uploadToCloudinary(
      imageData, folder, cloudName, apiKey, apiSecret, publicId
    )

    // Update user cover_image in DB
    await c.env.DB.prepare(
      'UPDATE users SET cover_image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(result.url, payload.id).run()

    return c.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ==================== ADMIN IMAGE UPLOAD ====================
// POST /api/upload/admin
// Admin can upload any image (anime cover, banner, episode thumbnail)
// Requires: Admin token in Authorization header
uploadRoutes.post('/admin', async (c) => {
  const auth = c.req.header('Authorization')
  if (!auth) return c.json({ error: 'Authentication required' }, 401)

  try {
    const token = auth.replace('Bearer ', '')
    const payload = await verifyToken(token, c.env.JWT_SECRET || 'donghua-secret-key-2024')

    // Must be admin
    if (payload.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }

    const cloudName = c.env.CLOUDINARY_CLOUD_NAME
    const apiKey = c.env.CLOUDINARY_API_KEY
    const apiSecret = c.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return c.json({ error: 'Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET secrets.' }, 503)
    }

    const contentType = c.req.header('Content-Type') || ''
    let imageData: string | ArrayBuffer
    let folder = 'donghualand/admin'
    let uploadType = 'general'

    let fileType = 'image/jpeg'
    if (contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData()
      const file = formData.get('image') as File | null
      if (!file) return c.json({ error: 'No image file provided' }, 400)
      if (!file.type.startsWith('image/')) return c.json({ error: 'Only image files are allowed' }, 400)
      if (file.size > 20 * 1024 * 1024) return c.json({ error: 'Image must be smaller than 20MB' }, 400)
      
      // Get optional folder/type param
      uploadType = String(formData.get('type') || 'general')
      fileType = file.type || 'image/jpeg'
      imageData = await file.arrayBuffer()
    } else {
      const body = await c.req.json()
      if (!body.data) return c.json({ error: 'No image data provided' }, 400)
      imageData = body.data
      uploadType = body.type || 'general'
    }

    // Map upload type to folder
    const folderMap: Record<string, string> = {
      cover: 'donghualand/anime/covers',
      banner: 'donghualand/anime/banners',
      thumbnail: 'donghualand/episodes/thumbnails',
      general: 'donghualand/admin',
    }
    folder = folderMap[uploadType] || 'donghualand/admin'

    const result = await uploadToCloudinary(
      imageData, folder, cloudName, apiKey, apiSecret, undefined, fileType
    )

    return c.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      type: uploadType,
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})
