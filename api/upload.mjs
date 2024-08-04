import { IncomingForm } from "formidable"
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export async function uploadImage(req) {
  const form = new IncomingForm()

  const [fields, files] = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      resolve([fields, files])
    })
  })
  const file = files.image
  const resizedImageBuffer = await sharp(file.filepath)
    .resize(768, 768, { fit: 'inside', withoutEnlargement: true })
    .toBuffer()

  const timestamp = Date.now();
  const newFilename = `15alexanderproperties-blob/${uuidv4()}-${timestamp}.jpg`;

  // Upload to Vercel Blob Storage
  const { url } = await put(newFilename, resizedImageBuffer, {
    access: 'public',
    addRandomSuffix: true,
    metadata: {
      uploadedAt: new Date().toISOString(),
    },
  });

  return { imageUrl: url }
}

// Keep the default export for direct API calls if needed
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  try {
    const result = await uploadImage(req);
    res.status(200).json(result);
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "Upload failed" })
  }
}
