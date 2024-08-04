import fetch from "node-fetch"
import { DETERMINATION_SYSTEM_PROMPT } from "../prompts/determination.mjs"

async function generateDetermination(imageUrl, COTAnalysis) {
	const apiKey = process.env.OPENAI_API_KEY
	const apiUrl = "https://api.openai.com/v1/chat/completions"

	const systemPrompt = DETERMINATION_SYSTEM_PROMPT.replace("{{COT}}", COTAnalysis)

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

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const response = await fetch(apiUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model: "gpt-4o",
					messages: messages,
					max_tokens: 1000,
				}),
			})

			if (!response.ok) {
				throw new Error(`OpenAI API request failed: ${response.statusText}`)
			}

			const data = await response.json()
			return JSON.parse(data.choices[0].message.content)
		} catch (error) {
			if (attempt === maxRetries) {
				throw error
			}
			console.error(`Attempt ${attempt} failed. Retrying in ${retryDelay}ms...`)
			await new Promise(resolve => setTimeout(resolve, retryDelay))
		}
	}
}

export default generateDetermination
