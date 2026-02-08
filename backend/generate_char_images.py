"""
Generate character illustration images using PIL
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'images', 'characters')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def create_illustration_ba():
    """Generate illustration for 把 - a hand holding/grasping"""
    img = Image.new('RGB', (400, 400), color='#FFF5F5')
    draw = ImageDraw.Draw(img)
    
    # Background decorative elements
    draw.rectangle([0, 0, 400, 400], fill='#FFF0F0', outline='#FFD0D0', width=2)
    
    # Draw a simple hand illustration (stylized)
    # Palm
    draw.ellipse([120, 180, 280, 320], fill='#FFE4C4', outline='#DEB887', width=3)
    
    # Fingers (4 fingers)
    finger_colors = ['#FFE4C4', '#FFE4C4', '#FFE4C4', '#FFE4C4']
    finger_positions = [
        (130, 100, 170, 200),   # index
        (170, 80, 210, 190),    # middle
        (210, 90, 250, 200),    # ring
        (250, 120, 290, 210),   # pinky
    ]
    
    for pos in finger_positions:
        draw.rounded_rectangle(pos, radius=20, fill='#FFE4C4', outline='#DEB887', width=2)
    
    # Thumb
    draw.rounded_rectangle([80, 200, 140, 280], radius=15, fill='#FFE4C4', outline='#DEB887', width=2)
    
    # Object being held (a handle/bar)
    draw.rounded_rectangle([150, 50, 250, 350], radius=10, fill='#8B4513', outline='#5D3A1A', width=3)
    
    # Add some decorative dots
    for i in range(5):
        x, y = 50 + i * 70, 350
        draw.ellipse([x, y, x+15, y+15], fill='#FFB6C1')
    
    # Save
    img.save(os.path.join(OUTPUT_DIR, 'ba_illustration.png'))
    print("✅ Generated illustration for 把")


def create_illustration_ba_father():
    """Generate illustration for 爸 - father figure"""
    img = Image.new('RGB', (400, 400), color='#FFF8F0')
    draw = ImageDraw.Draw(img)
    
    # Background
    draw.rectangle([0, 0, 400, 400], fill='#FFF8F0', outline='#FFDAB9', width=2)
    
    # Draw a father figure (simplified)
    # Head
    draw.ellipse([160, 50, 240, 130], fill='#FFE4C4', outline='#DEB887', width=2)
    
    # Hair
    draw.arc([155, 45, 245, 100], start=0, end=180, fill='#4A4A4A', width=20)
    
    # Eyes
    draw.ellipse([175, 85, 190, 100], fill='#333')
    draw.ellipse([210, 85, 225, 100], fill='#333')
    
    # Smile
    draw.arc([180, 100, 220, 120], start=0, end=180, fill='#FF6B6B', width=3)
    
    # Body (shirt)
    draw.polygon([(160, 140), (240, 140), (260, 280), (140, 280)], 
                 fill='#4169E1', outline='#27408B', width=2)
    
    # Tie
    draw.polygon([(190, 140), (210, 140), (215, 200), (200, 220), (185, 200)],
                 fill='#DC143C', outline='#8B0000', width=1)
    
    # Arms
    draw.rounded_rectangle([100, 160, 150, 260], radius=20, fill='#FFE4C4', outline='#DEB887', width=2)
    draw.rounded_rectangle([250, 160, 300, 260], radius=20, fill='#FFE4C4', outline='#DEB887', width=2)
    
    # Child holding hand (small figure)
    # Child head
    draw.ellipse([280, 200, 330, 250], fill='#FFE4C4', outline='#DEB887', width=2)
    # Child body
    draw.polygon([(290, 250), (320, 250), (330, 320), (280, 320)],
                 fill='#FFD700', outline='#DAA520', width=2)
    
    # Connection line showing father-child bond
    draw.line([(300, 230), (260, 200)], fill='#FF69B4', width=3)
    
    # Hearts to show love
    heart_positions = [(50, 50), (320, 80), (60, 300)]
    for hx, hy in heart_positions:
        draw.polygon([(hx+15, hy+5), (hx+25, hy+15), (hx+15, hy+25), (hx+5, hy+15)],
                     fill='#FF69B4')
    
    img.save(os.path.join(OUTPUT_DIR, 'ba_father_illustration.png'))
    print("✅ Generated illustration for 爸")


def create_illustration_bai():
    """Generate illustration for 百 - ruler with grains"""
    img = Image.new('RGB', (400, 400), color='#FFFAF0')
    draw = ImageDraw.Draw(img)
    
    # Background
    draw.rectangle([0, 0, 400, 400], fill='#FFFAF0', outline='#FFE4B5', width=2)
    
    # Draw a ruler (尺子)
    ruler_x = 100
    draw.rectangle([ruler_x, 50, ruler_x + 60, 350], fill='#DEB887', outline='#8B6914', width=3)
    
    # Ruler markings
    for i in range(11):
        y = 60 + i * 28
        mark_width = 40 if i % 5 == 0 else 25
        draw.line([(ruler_x + 10, y), (ruler_x + 10 + mark_width, y)], fill='#333', width=2)
    
    # Numbers on ruler
    try:
        font = ImageFont.truetype("/System/Library/Fonts/STHeiti Light.ttc", 20)
    except:
        font = ImageFont.load_default()
    
    # Draw grains (米粒) at the bottom
    grain_colors = ['#FFD700', '#FFA500', '#FF8C00', '#DAA520', '#B8860B']
    grain_positions = [
        (200, 280), (230, 290), (260, 285), (290, 295), (320, 280),
        (215, 310), (245, 320), (275, 315), (305, 325),
        (230, 340), (260, 350), (290, 345)
    ]
    
    for i, (gx, gy) in enumerate(grain_positions):
        color = grain_colors[i % len(grain_colors)]
        draw.ellipse([gx, gy, gx + 20, gy + 25], fill=color, outline='#B8860B', width=1)
    
    # More grains scattered around to represent "hundred"
    for i in range(20):
        import random
        gx = random.randint(180, 350)
        gy = random.randint(250, 380)
        draw.ellipse([gx, gy, gx + 15, gy + 18], fill='#FFD700', outline='#DAA520', width=1)
    
    # Text annotation
    draw.text((220, 220), "一百粒米", fill='#8B4513', font=font)
    
    # Flowers around for "百花齐放"
    flower_colors = ['#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB', '#FF6347']
    flower_positions = [(40, 80), (350, 150), (30, 280), (360, 320)]
    
    for i, (fx, fy) in enumerate(flower_positions):
        color = flower_colors[i % len(flower_colors)]
        # Simple flower
        for angle in range(0, 360, 60):
            import math
            rad = math.radians(angle)
            px = fx + 20 + int(15 * math.cos(rad))
            py = fy + 20 + int(15 * math.sin(rad))
            draw.ellipse([px-8, py-8, px+8, py+8], fill=color)
        draw.ellipse([fx+12, fy+12, fx+28, fy+28], fill='#FFD700')
    
    img.save(os.path.join(OUTPUT_DIR, 'bai_illustration.png'))
    print("✅ Generated illustration for 百")


def generate_all():
    """Generate all character illustrations"""
    print("🎨 Generating character illustrations...")
    create_illustration_ba()
    create_illustration_ba_father()
    create_illustration_bai()
    print(f"\n✅ All illustrations saved to: {OUTPUT_DIR}")


if __name__ == "__main__":
    generate_all()
