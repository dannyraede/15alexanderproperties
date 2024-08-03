import os

# List of Christopher Alexander's 15 fundamental properties of wholeness
properties = [
    "levelsOfScale",
    "strongCenters",
    "boundaries",
    "alternatingRepetition",
    "positiveSpace",
    "goodShape",
    "localSymmetries",
    "deepInterlockAndAmbiguity",
    "contrast",
    "gradients",
    "roughness",
    "echoes",
    "theVoid",
    "simplicityAndInnerCalm",
    "notSeparateness"
]

# Get the directory of the current script
current_dir = os.path.dirname(os.path.abspath(__file__))

# Create .mjs files for each property
for index, property in enumerate(properties, start=1):
    filename = f"{index}_{property}_definition.mjs"
    file_path = os.path.join(current_dir, filename)
    
    with open(file_path, 'w') as file:
        file.write(f"export const {property.upper()}_DEFINITION = ``\n")
    
    print(f"Created: {filename}")

print("All files have been created successfully.")
