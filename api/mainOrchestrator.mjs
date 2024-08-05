import { uploadImage } from "./upload.mjs"
import { analyzeImage } from "./inference/prompthandler.mjs"

// Configure the API to disable body parsing, as we'll handle file uploads manually
export const config = {
	api: {
		bodyParser: false,
	},
}

/**
 * Main orchestrator function for handling image upload and analysis
 * @param {Object} req - The incoming HTTP request object
 * @param {Object} res - The HTTP response object
 */
export default async function handler(req, res) {
	console.log("Handler function called")
	console.log("Request method:", req.method)

	// Ensure the request method is POST
	if (req.method !== "POST") {
		console.log("Method not allowed:", req.method)
		return res.status(405).json({ error: "Method Not Allowed" })
	}

	try {
		console.log("Starting image processing")

		// Verify that the OpenAI API key is set in the environment variables
		if (!process.env.OPENAI_API_KEY) {
			throw new Error("OPENAI_API_KEY is not set in environment variables")
		}

		// Step 1: Upload the image
		console.log("Step 1: Uploading image")
		const { imageUrl } = await uploadImage(req)
		console.log("Image uploaded successfully. URL:", imageUrl)

		// Step 2: Use the image URL directly
		console.log("Step 2: Using the uploaded image URL")
		const fullImageUrl = imageUrl
		console.log("Full image URL:", fullImageUrl)

		// Step 3: Analyze the image using the AI model
		console.log("Step 3: Analyzing image")
		const analysisResults = await analyzeImage(fullImageUrl)
		console.log("Image analysis completed")
		console.log("Analysis results:", JSON.stringify(analysisResults, null, 2))

		// Step 4: Process and format the results
		console.log("Step 4: Formatting results")
		const formattedResults = analysisResults.deepAnalysis
		console.log("Formatted results:", JSON.stringify(formattedResults, null, 2))

		// Step 5: Return the formatted results to the client
		console.log("Step 5: Sending response")
		res.status(200).json(formattedResults)
		console.log("Response sent successfully")
	} catch (error) {
		// Log the full error for debugging purposes
		console.error("Orchestration error:", error)
		
		// Send a user-friendly error message to the client
		res.status(500).json({ error: "Processing failed", details: error.message })
		console.log("Error response sent")
	}
}
