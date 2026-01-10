from PIL import Image, ImageDraw, ImageOps

def add_rounded_corners(image_path, output_path, radius):
    im = Image.open(image_path)
    im = im.convert("RGBA")
    
    # Create mask
    mask = Image.new('L', im.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), im.size], radius=radius, fill=255)
    
    # Apply mask
    output = ImageOps.fit(im, mask.size, centering=(0.5, 0.5))
    output.putalpha(mask)
    
    output.save(output_path)
    print(f"Saved processed image to {output_path}")

# Source is the JPG user provided
source_path = "/Users/rishabh/.gemini/antigravity/brain/751e49c3-74b3-4474-acec-eabdf90356f9/uploaded_image_1768042894001.jpg"

# Process for each size (though we can just process base and resize later, sips does better resizing sometimes)
# Let's process the large base one first
output_base = "icons/neon_transparent_base.png"

# Radius: ~22% of dimension is standard for iOS/macOS style squircles, let's go with a safe 20%
# Image size is likely large.
im = Image.open(source_path)
radius = int(min(im.size) * 0.20)

add_rounded_corners(source_path, output_base, radius)
