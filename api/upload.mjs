import { IncomingForm } from "formidable"
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export async function uploadImage(req) {
  console.log('Starting uploadImage function');
  const form = new IncomingForm()

  console.log('Parsing form data');
  const [fields, files] = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return reject(err);
      }
      console.log('Form parsed successfully');
      resolve([fields, files]);
    })
  })
  console.log('Form data parsed:', { fields, files });

  const file = files.image;
  console.log('Image file:', file);

  console.log('Resizing image');
  const resizedImageBuffer = await sharp(file.filepath)
    .resize(768, 768, { fit: 'inside', withoutEnlargement: true })
    .toBuffer()
  console.log('Image resized');

  const timestamp = Date.now();
  const newFilename = `15alexanderproperties-blob/${uuidv4()}-${timestamp}.jpg`;
  console.log('New filename:', newFilename);

  // Upload to Vercel Blob Storage
  console.log('Uploading to Vercel Blob Storage');
  const { url } = await put(newFilename, resizedImageBuffer, {
    access: 'public',
    addRandomSuffix: true,
    metadata: {
      uploadedAt: new Date().toISOString(),
    },
  });
  console.log('Upload successful. URL:', url);

  return { imageUrl: url }
}

// Keep the default export for direct API calls if needed
export default async function handler(req, res) {
  console.log('Handler function called');
  console.log('Request method:', req.method);

  if (req.method !== "POST") {
    console.log('Method not allowed');
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  try {
    console.log('Calling uploadImage function');
    const result = await uploadImage(req);
    console.log('Upload result:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Upload error:", error)
    console.error("Error stack:", error.stack)
    res.status(500).json({ error: "Upload failed", details: error.message })
  }
}
