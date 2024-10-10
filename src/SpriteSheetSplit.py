from PIL import Image
import os

# Path to the sprite sheet image
sprite_sheet_path = './Minotaur - Sprite Sheet.png'

# Load the sprite sheet
sprite_sheet = Image.open(sprite_sheet_path).convert('RGBA')

# Get the dimensions of the entire sprite sheet
sheet_width, sheet_height = sprite_sheet.size

# Constants for sprite dimensions and rows
sprite_width = 140
sprite_height = 96
num_rows = 20

# Create output directory if it doesn't exist
output_dir = './split_animations'
os.makedirs(output_dir, exist_ok=True)

# Iterate over each row (each animation)
for row in range(num_rows):
    # Calculate the number of sprites (columns) in this row
    num_columns = sheet_width // sprite_width

    animation_frames = []
    for col in range(num_columns):
        # Calculate the position of each sprite in the sheet
        left = col * sprite_width
        upper = row * sprite_height
        right = left + sprite_width
        lower = upper + sprite_height

        # Crop the sprite
        sprite = sprite_sheet.crop((left, upper, right, lower))
        animation_frames.append(sprite)

    # Save the animation as a new image file
    animation_name = f'animation_row_{row + 1}.png'
    animation_path = os.path.join(output_dir, animation_name)

    # Create a new image to store all the frames of this animation horizontally
    animation_image = Image.new('RGBA', (sprite_width * len(animation_frames), sprite_height))
    for i, frame in enumerate(animation_frames):
        animation_image.paste(frame, (i * sprite_width, 0))
    
    animation_image.save(animation_path)

print("Animations have been successfully split and saved.")
