import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageFont
import math
import random

# Load person preview
img = Image.open('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/person-preview.jpg').convert('L')
w, h = 600, 750
img = img.resize((w, h))

arr = np.array(img, dtype=np.float32) / 255.0
density = 1.0 - arr
# Threshold out flat background if light
density = np.clip((density - 0.12) / 0.75, 0.0, 1.0)

# Edge detection
edges = img.filter(ImageFilter.FIND_EDGES)
edge_arr = np.array(edges, dtype=np.float32) / 255.0

out = Image.new('RGB', (w, h), (250, 248, 245))
draw = ImageDraw.Draw(out)

# 1. Background text (strictly outside subject: density < 0.05)
phrases = ["I Love You", "Je t'aime", "Ich liebe dich", "Te amo", "我爱你", "愛してる", "أحبك", "Ti amo", "Eu te amo"]
p_idx = 0
for y in range(30, h - 30, 28):
    for x in range(30, w - 100, 90):
        # Check area for subject
        sub_d = density[max(0, y-15):min(h, y+15), max(0, x-15):min(w, x+15)]
        if np.max(sub_d) < 0.1:
            draw.text((x, y), phrases[p_idx % len(phrases)], fill=(160, 160, 165))
            p_idx += 1

# 2. Scribble loops inside subject
# Flow along contours
for y in range(40, h - 40, 8):
    for x in range(40, w - 40, 8):
        d = density[y, x]
        if d > 0.15:
            # Draw circular/elliptical curly loops
            num_loops = int(1 + d * 4)
            r = 3.0 + (1.0 - d) * 7.0
            pts = []
            steps = 14
            for s in range(steps * num_loops):
                th = s * 0.55
                cx = x + math.cos(th) * r + (random.random() - 0.5) * 2
                cy = y + math.sin(th) * r + (random.random() - 0.5) * 2
                pts.append((cx, cy))
            if len(pts) > 1:
                draw.line(pts, fill=(25, 25, 30), width=1)

# 3. Contour feature lines (eyes, nose, jawline)
for y in range(40, h - 40, 4):
    for x in range(40, w - 40, 4):
        if edge_arr[y, x] > 0.25 and density[y, x] > 0.2:
            # Short expressive contour stroke
            draw.line([(x-2, y), (x+2, y+1)], fill=(15, 15, 20), width=1)

out.save('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/test-perfect-scribble.png')
print("Saved test-perfect-scribble.png successfully")
