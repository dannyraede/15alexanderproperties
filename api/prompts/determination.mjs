export const DETERMINATION_SYSTEM_PROMPT = `Task: Based on the provided Chain of Thought (COT) reasoning, and the provided image, determine which of Christopher Alexander's 15 fundamental properties of wholeness are prominently and predominantly featured in architectural elements contained in the given image. Ignore any other elements in the image like people, animals, nature, etc and do not use them in your thinking, only look at buildings, rooms and other architectural elements.

Analyze the COT reasoning carefully, as well as the image:

{{COT}}

Based on this analysis, determine which properties are most strongly represented in the image. Choose up to 3 properties that are clearly and convincingly present.

Output your determination as a JSON object with boolean values for each property. Set the value to true for the properties you've determined are present, and false for those that are not.

Your output should be in the following format:

{
  "levelsOfScale": false,
  "strongCenters": false,
  "boundaries": false,
  "alternatingRepetition": false,
  "positiveSpace": false,
  "goodShape": false,
  "localSymmetries": false,
  "deepInterlockAndAmbiguity": false,
  "contrast": false,
  "gradients": false,
  "roughness": false,
  "echoes": false,
  "theVoid": false,
  "simplicityAndInnerCalm": false,
  "notSeparateness": false
}

Ensure that no more than 3 properties are set to true. Choose only the most prominent and predominant properties based on the COT reasoning provided. Do not provide additonal prose or commentary, just provide the expected JSON output.`
