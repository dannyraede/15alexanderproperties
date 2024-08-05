import fetch from "node-fetch"
import { DETERMINATION_SYSTEM_PROMPT } from "../prompts/determination.mjs"

/**
 * Generates a determination of properties based on the Chain of Thought (COT) analysis and the image.
 * 
 * @param {string} imageUrl - The URL of the image to be analyzed.
 * @param {string} COTAnalysis - The Chain of Thought analysis generated in the previous step.
 * @returns {Promise<Object>} A promise that resolves to the parsed JSON object containing the determined properties.
 * @throws {Error} If the API request fails after maximum retries.
 */
async function generateDetermination(imageUrl, COTAnalysis) {
	console.log("Starting generateDetermination function")
	const apiKey = process.env.OPENAI_API_KEY
	const apiUrl = "https://api.openai.com/v1/chat/completions"

	// Prepare the system prompt by inserting the COT analysis
	console.log("Preparing system prompt")
	const systemPrompt = DETERMINATION_SYSTEM_PROMPT.replace("{{COT}}", COTAnalysis)

	// Prepare the messages for the API call
	console.log("Preparing messages for API call")
	const messages = [
		{
			role: "system",
			content: systemPrompt,
		},
		{
			role: "user",
			content: [
				{
					type: "text",
					text: "Determine the properties based on the COT analysis and this image.",
				},
				{
					type: "image_url",
					image_url: {
						url: imageUrl,
					},
				},
			],
		},
	]

	const maxRetries = 3
	const retryDelay = 1000 // 1 second

	// Retry loop for API requests
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		console.log(`Attempt ${attempt} of ${maxRetries}`)
		try {
			// Send the request to the OpenAI API
			console.log("Sending request to OpenAI API")
			const response = await fetch(apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model: "gpt-4o",
					messages: messages,
					max_tokens: 1500,
				}),
			})

			// Check if the response is successful
			if (!response.ok) {
				throw new Error(`OpenAI API request failed: ${response.statusText}`)
			}

			// Parse the response and return the result
			console.log("Parsing response")
			const data = await response.json()
			console.log("Determination generated successfully")
			return JSON.parse(data.choices[0].message.content)
		} catch (error) {
			// Log the error and retry if attempts remain
			console.error(`Error in attempt ${attempt}:`, error)
			console.error("Error stack:", error.stack)
			if (attempt === maxRetries) {
				console.error("Max retries reached. Throwing error.")
				throw error
			}
			console.log(`Retrying in ${retryDelay}ms...`)
			await new Promise((resolve) => setTimeout(resolve, retryDelay))
		}
	}
}

export default generateDetermination
