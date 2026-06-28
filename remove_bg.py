from PIL import Image

def remove_background(image_path):
    img = Image.open(image_path).convert("RGBA")
    pixels = img.load()
    
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # If the pixel is very close to white
            if r > 240 and g > 240 and b > 240:
                pixels[x, y] = (r, g, b, 0) # Make fully transparent
            elif r > 200 and g > 200 and b > 200:
                # Anti-aliasing edges - make them partially transparent
                # Map 200-240 to alpha 255-0
                alpha = int(255 - ((max(r,g,b) - 200) * (255 / 40)))
                # Darken the pixel so it doesn't look like a white halo
                pixels[x, y] = (int(r*0.8), int(g*0.8), int(b*0.8), max(0, alpha))

    img.save(image_path, "PNG")
    print("Background removed successfully.")

remove_background("frontend/public/fasal_logo.png")
