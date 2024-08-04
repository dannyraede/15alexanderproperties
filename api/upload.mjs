import { IncomingForm } from "formidable"
import { put } from "@vercel/blob"
import sharp from "sharp"
import { v4 as uuidv4 } from "uuid"

export async function uploadImage(req) {
	console.log("Starting uploadImage function")
	const form = new IncomingForm()

	console.log("Parsing form data")
	const [fields, files] = await new Promise((resolve, reject) => {
		form.parse(req, (err, fields, files) => {
			if (err) {
				console.error("Error parsing form:", err)
				return reject(err)
			}
			console.log("Form parsed successfully")
			resolve([fields, files])
		})
	})
	console.log("Form data parsed:", { fields, files: JSON.stringify(files, null, 2) })

	const fileArray = files.image
	console.log("Image file array:", JSON.stringify(fileArray, null, 2))

	if (!Array.isArray(fileArray) || fileArray.length === 0) {
		console.error("Error: No file uploaded")
		throw new Error("No file uploaded")
	}

	const file = fileArray[0]
	console.log("Image file:", JSON.stringify(file, null, 2))

	if (!file || !file.filepath) {
		console.error("Error: file.filepath is undefined")
		throw new Error("Invalid file object: filepath is undefined")
	}

	console.log("File path:", file.filepath)

	console.log("Resizing image")
	let resizedImageBuffer
	try {
		resizedImageBuffer = await sharp(file.filepath).resize(768, 768, { fit: "inside", withoutEnlargement: true }).toBuffer()
		console.log("Image resized successfully")

		// Verify the resized image
		const metadata = await sharp(resizedImageBuffer).metadata()
		console.log("Resized image metadata:", metadata)

		if (!["jpeg", "png", "webp"].includes(metadata.format)) {
			throw new Error(`Unsupported image format after resize: ${metadata.format}`)
		}
	} catch (error) {
		console.error("Error resizing or validating image:", error)
		throw new Error(`Failed to process image: ${error.message}`)
	}

	const timestamp = Date.now()
	const newFilename = `15alexanderproperties-blob/${uuidv4()}-${timestamp}.jpg`
	console.log("New filename:", newFilename)

	// Upload to Vercel Blob Storage
	console.log("Uploading to Vercel Blob Storage")
	let url
	try {
		const result = await put(newFilename, resizedImageBuffer, {
			access: "public",
			addRandomSuffix: true,
			metadata: {
				uploadedAt: new Date().toISOString(),
			},
		})
		url = result.url
		console.log("Upload successful. URL:", url)
	} catch (error) {
		console.error("Error uploading to Vercel Blob Storage:", error)
		throw new Error(`Failed to upload image: ${error.message}`)
	}

	// Verify the uploaded image
	try {
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error(`Failed to fetch uploaded image: ${response.status} ${response.statusText}`)
		}
		const buffer = await response.arrayBuffer()
		console.log("Uploaded image size:", buffer.byteLength)
	} catch (error) {
		console.error("Error verifying uploaded image:", error)
		throw new Error(`Failed to verify uploaded image: ${error.message}`)
	}

	return { imageUrl: url }
}

// Keep the default export for direct API calls if needed
export default async function handler(req, res) {
	console.log("Handler function called")
	console.log("Request method:", req.method)

	if (req.method !== "POST") {
		console.log("Method not allowed")
		return res.status(405).json({ error: "Method Not Allowed" })
	}

	try {
		console.log("Calling uploadImage function")
		const result = await uploadImage(req)
		console.log("Upload result:", result)
		res.status(200).json(result)
	} catch (error) {
		console.error("Upload error:", error)
		console.error("Error stack:", error.stack)
		res.status(500).json({ error: "Upload failed", details: error.message })
	}
}
