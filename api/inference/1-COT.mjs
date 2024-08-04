import fetch from "node-fetch"
import { COT_SYSTEM_PROMPT } from "../prompts/COT.mjs"
import { LEVELSOFSCALE_DEFINITION } from "../prompts/definitions/1_levelsOfScale_definition.mjs"
import { STRONGCENTERS_DEFINITION } from "../prompts/definitions/2_strongCenters_definition.mjs"
import { BOUNDARIES_DEFINITION } from "../prompts/definitions/3_boundaries_definition.mjs"
import { ALTERNATINGREPETITION_DEFINITION } from "../prompts/definitions/4_alternatingRepetition_definition.mjs"
import { POSITIVESPACE_DEFINITION } from "../prompts/definitions/5_positiveSpace_definition.mjs"
import { GOODSHAPE_DEFINITION } from "../prompts/definitions/6_goodShape_definition.mjs"
import { LOCALSYMMETRIES_DEFINITION } from "../prompts/definitions/7_localSymmetries_definition.mjs"
import { DEEPINTERLOCKANDAMBIGUITY_DEFINITION } from "../prompts/definitions/8_deepInterlockAndAmbiguity_definition.mjs"
import { CONTRAST_DEFINITION } from "../prompts/definitions/9_contrast_definition.mjs"
import { GRADIENTS_DEFINITION } from "../prompts/definitions/10_gradients_definition.mjs"
import { ROUGHNESS_DEFINITION } from "../prompts/definitions/11_roughness_definition.mjs"
import { ECHOES_DEFINITION } from "../prompts/definitions/12_echoes_definition.mjs"
import { THEVOID_DEFINITION } from "../prompts/definitions/13_theVoid_definition.mjs"
import { SIMPLICITYANDINNERCALM_DEFINITION } from "../prompts/definitions/14_simplicityAndInnerCalm_definition.mjs"
import { NOTSEPARATENESS_DEFINITION } from "../prompts/definitions/15_notSeparateness_definition.mjs"

function mergeDefinitions(prompt) {
	console.log("Merging definitions")
	const mergedPrompt = prompt.replace("{{1-definition}}", LEVELSOFSCALE_DEFINITION).replace("{{2-definition}}", STRONGCENTERS_DEFINITION).replace("{{3-definition}}", BOUNDARIES_DEFINITION).replace("{{4-definition}}", ALTERNATINGREPETITION_DEFINITION).replace("{{5-definition}}", POSITIVESPACE_DEFINITION).replace("{{6-definition}}", GOODSHAPE_DEFINITION).replace("{{7-definition}}", LOCALSYMMETRIES_DEFINITION).replace("{{8-definition}}", DEEPINTERLOCKANDAMBIGUITY_DEFINITION).replace("{{9-definition}}", CONTRAST_DEFINITION).replace("{{10-definition}}", GRADIENTS_DEFINITION).replace("{{11-definition}}", ROUGHNESS_DEFINITION).replace("{{12-definition}}", ECHOES_DEFINITION).replace("{{13-definition}}", THEVOID_DEFINITION).replace("{{14-definition}}", SIMPLICITYANDINNERCALM_DEFINITION).replace("{{15-definition}}", NOTSEPARATENESS_DEFINITION)
	console.log("Definitions merged")
	return mergedPrompt
}

async function generateCOTAnalysis(imageUrl) {
	console.log("Starting COT analysis generation")
	const apiKey = process.env.OPENAI_API_KEY
	const apiUrl = "https://api.openai.com/v1/chat/completions"

	// Log a masked version of the API key for debugging
	console.log("API Key (masked):", apiKey ? `${apiKey.slice(0, 5)}...${apiKey.slice(-5)}` : "Not set")

	if (!apiKey) {
		throw new Error("OPENAI_API_KEY is not set in environment variables")
	}

	console.log("Preparing system prompt")
	const systemPrompt = mergeDefinitions(COT_SYSTEM_PROMPT)

	console.log("Image URL:", imageUrl) // Log the image URL for debugging

	const messages = [
		{ role: "system", content: systemPrompt },
		{
			role: "user",
			content: [
				{ type: "text", text: "Analyze this image based on the given instructions." },
				{ type: "image_url", image_url: { url: imageUrl } },
			],
		},
	]

	const maxRetries = 3
	const retryDelay = 1000

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		console.log(`Attempt ${attempt} of ${maxRetries}`)
		try {
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

			if (!response.ok) {
				const errorBody = await response.text()
				console.error(`OpenAI API Error (${response.status}):`, errorBody)
				throw new Error(`OpenAI API request failed: ${response.status} - ${errorBody}`)
			}

			console.log("Parsing response")
			const data = await response.json()
			console.log("Analysis generated successfully")
			return data.choices[0].message.content
		} catch (error) {
			console.error(`Error in attempt ${attempt}:`, error.message)
			if (attempt === maxRetries) {
				console.error("Max retries reached. Throwing error.")
				throw error
			}
			console.log(`Retrying in ${retryDelay}ms...`)
			await new Promise((resolve) => setTimeout(resolve, retryDelay))
		}
	}
}

export default generateCOTAnalysis
