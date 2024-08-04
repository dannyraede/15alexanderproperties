import fetch from "node-fetch"
import { LEVELSOFSCALE_SYSTEM_PROMPT } from "../prompts/properties/1_levelsOfScale.mjs"
import { STRONGCENTERS_SYSTEM_PROMPT } from "../prompts/properties/2_strongCenters.mjs"
import { BOUNDARIES_SYSTEM_PROMPT } from "../prompts/properties/3_boundaries.mjs"
import { ALTERNATINGREPETITION_SYSTEM_PROMPT } from "../prompts/properties/4_alternatingRepetition.mjs"
import { POSITIVESPACE_SYSTEM_PROMPT } from "../prompts/properties/5_positiveSpace.mjs"
import { GOODSHAPE_SYSTEM_PROMPT } from "../prompts/properties/6_goodShape.mjs"
import { LOCALSYMMETRIES_SYSTEM_PROMPT } from "../prompts/properties/7_localSymmetries.mjs"
import { DEEPINTERLOCKANDAMBIGUITY_SYSTEM_PROMPT } from "../prompts/properties/8_deepInterlockAndAmbiguity.mjs"
import { CONTRAST_SYSTEM_PROMPT } from "../prompts/properties/9_contrast.mjs"
import { GRADIENTS_SYSTEM_PROMPT } from "../prompts/properties/10_gradients.mjs"
import { ROUGHNESS_SYSTEM_PROMPT } from "../prompts/properties/11_roughness.mjs"
import { ECHOES_SYSTEM_PROMPT } from "../prompts/properties/12_echoes.mjs"
import { THEVOID_SYSTEM_PROMPT } from "../prompts/properties/13_theVoid.mjs"
import { SIMPLICITYANDINNERCALM_SYSTEM_PROMPT } from "../prompts/properties/14_simplicityAndInnerCalm.mjs"
import { NOTSEPARATENESS_SYSTEM_PROMPT } from "../prompts/properties/15_notSeparateness.mjs"

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

console.log("Starting deep analysis module")

const propertyPrompts = {
	levelsOfScale: LEVELSOFSCALE_SYSTEM_PROMPT,
	strongCenters: STRONGCENTERS_SYSTEM_PROMPT,
	boundaries: BOUNDARIES_SYSTEM_PROMPT,
	alternatingRepetition: ALTERNATINGREPETITION_SYSTEM_PROMPT,
	positiveSpace: POSITIVESPACE_SYSTEM_PROMPT,
	goodShape: GOODSHAPE_SYSTEM_PROMPT,
	localSymmetries: LOCALSYMMETRIES_SYSTEM_PROMPT,
	deepInterlockAndAmbiguity: DEEPINTERLOCKANDAMBIGUITY_SYSTEM_PROMPT,
	contrast: CONTRAST_SYSTEM_PROMPT,
	gradients: GRADIENTS_SYSTEM_PROMPT,
	roughness: ROUGHNESS_SYSTEM_PROMPT,
	echoes: ECHOES_SYSTEM_PROMPT,
	theVoid: THEVOID_SYSTEM_PROMPT,
	simplicityAndInnerCalm: SIMPLICITYANDINNERCALM_SYSTEM_PROMPT,
	notSeparateness: NOTSEPARATENESS_SYSTEM_PROMPT,
}

const propertyDefinitions = {
	levelsOfScale: LEVELSOFSCALE_DEFINITION,
	strongCenters: STRONGCENTERS_DEFINITION,
	boundaries: BOUNDARIES_DEFINITION,
	alternatingRepetition: ALTERNATINGREPETITION_DEFINITION,
	positiveSpace: POSITIVESPACE_DEFINITION,
	goodShape: GOODSHAPE_DEFINITION,
	localSymmetries: LOCALSYMMETRIES_DEFINITION,
	deepInterlockAndAmbiguity: DEEPINTERLOCKANDAMBIGUITY_DEFINITION,
	contrast: CONTRAST_DEFINITION,
	gradients: GRADIENTS_DEFINITION,
	roughness: ROUGHNESS_DEFINITION,
	echoes: ECHOES_DEFINITION,
	theVoid: THEVOID_DEFINITION,
	simplicityAndInnerCalm: SIMPLICITYANDINNERCALM_DEFINITION,
	notSeparateness: NOTSEPARATENESS_DEFINITION,
}

console.log("Property prompts and definitions initialized")

function mergeDefinition(prompt, definition) {
	console.log("Merging definition for prompt")
	return prompt.replace("{{DEFINITION}}", definition)
}

async function analyzeProperty(property, imageUrl) {
	console.log(`Starting analysis for property: ${property}`)
	const apiKey = process.env.OPENAI_API_KEY
	const apiUrl = "https://api.openai.com/v1/chat/completions"

	console.log("Merging system prompt with definition")
	const systemPrompt = mergeDefinition(propertyPrompts[property], propertyDefinitions[property])

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
					text: `Analyze this image for the property specified.`,
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
		console.log(`Attempt ${attempt} of ${maxRetries} for property: ${property}`)
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
					max_tokens: 1000,
				}),
			})

			if (!response.ok) {
				throw new Error(`OpenAI API request failed: ${response.statusText}`)
			}

			console.log("Parsing response")
			const data = await response.json()
			console.log(`Analysis completed for property: ${property}`)
			return data.choices[0].message.content
		} catch (error) {
			console.error(`Error in attempt ${attempt} for property ${property}:`, error)
			if (attempt === maxRetries) {
				console.error("Max retries reached. Throwing error.")
				throw error
			}
			console.log(`Retrying in ${retryDelay}ms...`)
			await new Promise((resolve) => setTimeout(resolve, retryDelay))
		}
	}
}

async function generateDeepAnalysis(imageUrl, determinationResult) {
	console.log("Starting deep analysis generation")
	const deepAnalysisResults = {}

	for (const [property, isPresent] of Object.entries(determinationResult)) {
		console.log(`Processing property: ${property}, isPresent: ${isPresent}`)
		if (isPresent) {
			console.log(`Analyzing property: ${property}`)
			try {
				const analysis = await analyzeProperty(property, imageUrl)
				deepAnalysisResults[property] = {
					present: true,
					description: analysis,
				}
				console.log(`Analysis completed for property: ${property}`)
			} catch (error) {
				console.error(`Error analyzing property ${property}:`, error)
				deepAnalysisResults[property] = {
					present: true,
					description: "Error occurred during analysis",
					error: error.message,
				}
			}
		}
	}

	console.log("Deep analysis generation completed")
	return deepAnalysisResults
}

export default generateDeepAnalysis
