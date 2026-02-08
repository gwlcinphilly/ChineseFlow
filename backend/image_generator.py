"""
Simple image generator for Chinese characters using PIL
Style: Matching "bai" character illustration - warm pastel, decorative dots
"""
from PIL import Image, ImageDraw, ImageFont
import os
import random
from pathlib import Path

def generate_simple_image(character: str, description: str, output_dir: str, filename: str = None) -> str:
    """Generate a simple educational illustration for a Chinese character
    
    Style matches "bai" character illustration:
    - Warm cream/beige background
    - Soft rose/pink border
    - Decorative colored dots in corners
    - Small scattered dots
    - Clean, flat design
    
    Args:
        character: The Chinese character
        description: Description text
        output_dir: Output directory path
        filename: Optional custom filename (default: {character}_ai_generated.png)
    """
    
    # Fixed warm cream background (like "bai" character)
    width, height = 400, 400
    bg_color = (255, 248, 240)  # Warm cream/beige
    
    # Create image
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to load fonts
    font_large = None
    font_small = None
    
    try:
        font_paths = [
            "/System/Library/Fonts/STHeiti Light.ttc",
            "/System/Library/Fonts/PingFang.ttc",
            "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
            "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        ]
        
        for font_path in font_paths:
            if os.path.exists(font_path):
                font_large = ImageFont.truetype(font_path, 140)
                font_small = ImageFont.truetype(font_path, 22)
                break
    except:
        pass
    
    if font_large is None:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Draw soft rose border (like "bai" character)
    border_color = (220, 180, 180)  # Soft rose
    border_width = 6
    draw.rectangle([12, 12, width-12, height-12], outline=border_color, width=border_width)
    
    # Draw inner lighter border
    inner_border_color = (240, 200, 200)
    draw.rectangle([24, 24, width-24, height-24], outline=inner_border_color, width=2)
    
    # Draw corner decorative dots (like "bai" character)
    corner_colors = [
        (255, 182, 193),  # Light pink
        (255, 218, 185),  # Peach
        (255, 255, 224),  # Light yellow
        (230, 230, 250),  # Lavender
    ]
    
    corner_positions = [
        (20, 20), (width-50, 20), (20, height-50), (width-50, height-50)
    ]
    
    for i, (x, y) in enumerate(corner_positions):
        color = corner_colors[i % len(corner_colors)]
        # Draw flower-like shape (center dot + surrounding dots)
        draw.ellipse([x+8, y+8, x+32, y+32], fill=color)
        # Small surrounding dots
        draw.ellipse([x+2, y+15, x+10, y+23], fill=(255, 200, 200))
        draw.ellipse([x+30, y+15, x+38, y+23], fill=(255, 200, 200))
        draw.ellipse([x+15, y+2, x+23, y+10], fill=(255, 220, 200))
        draw.ellipse([x+15, y+30, x+23, y+38], fill=(255, 220, 200))
    
    # Draw scattered decorative dots
    random.seed(ord(character))
    dot_colors = [
        (255, 182, 193, 180),  # Pink
        (255, 218, 185, 180),  # Peach
        (255, 255, 224, 180),  # Yellow
        (230, 230, 250, 180),  # Lavender
        (200, 255, 220, 180),  # Mint
    ]
    
    for i in range(8):
        x = random.randint(40, width-60)
        y = random.randint(40, height-80)
        size = random.randint(6, 12)
        color = dot_colors[i % len(dot_colors)][:3]
        draw.ellipse([x, y, x+size, y+size], fill=color)
    
    # Draw the character in center (large, dark brown)
    bbox = draw.textbbox((0, 0), character, font=font_large)
    char_width = bbox[2] - bbox[0]
    char_height = bbox[3] - bbox[1]
    char_x = (width - char_width) // 2
    char_y = (height - char_height) // 2 - 35
    
    # Character color - dark brown
    char_color = (100, 60, 60)
    draw.text((char_x, char_y), character, font=font_large, fill=char_color)
    
    # Draw description text at bottom
    desc_text = f"{character} - {description[:12]}"
    bbox = draw.textbbox((0, 0), desc_text, font=font_small)
    text_width = bbox[2] - bbox[0]
    text_x = (width - text_width) // 2
    text_y = height - 55
    
    # Text color - warm brown
    text_color = (120, 80, 80)
    draw.text((text_x, text_y), desc_text, font=font_small, fill=text_color)
    
    # Save image
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Use provided filename or default
    if filename is None:
        filename = f"{character}_ai_generated.png"
    filepath = output_path / filename
    
    img.save(filepath, "PNG")
    
    return f"/images/characters/{filename}"


# Test
if __name__ == "__main__":
    output_dir = "/tmp/test_images"
    result = generate_simple_image("爱", "爱心", output_dir)
    print(f"Generated: {result}")
