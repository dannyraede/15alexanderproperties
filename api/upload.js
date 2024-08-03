import { IncomingForm } from "formidable"
import { promises as fs } from "fs"
import path from "path"

export const config = {
	api: {
		bodyParser: false,
	},
}

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method Not Allowed" })
	}

	try {
		const form = new IncomingForm()
		form.uploadDir = path.join(process.cwd(), "public", "uploads")
		form.keepExtensions = true

		const [fields, files] = await new Promise((resolve, reject) => {
			form.parse(req, (err, fields, files) => {
				if (err) return reject(err)
				resolve([fields, files])
			})
		})

		const file = files.image
		const newPath = path.join(form.uploadDir, file.newFilename)
		await fs.rename(file.filepath, newPath)

		const imageUrl = `/uploads/${file.newFilename}`
		res.status(200).json({ imageUrl })
	} catch (error) {
		console.error("Upload error:", error)
		res.status(500).json({ error: "Upload failed" })
	}
}
