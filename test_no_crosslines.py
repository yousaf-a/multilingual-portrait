import numpy as np
from PIL import Image, ImageFilter, ImageDraw
import math
import random

# Load person preview
img = Image.open('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/person-preview.jpg').convert('L')
w, h = 600, 750
img = img.resize((w, h))

arr = np.array(img, dtype=np.float32) / 255.0
density = 1.0 - arr
density = np.clip((density - 0.12) / 0.75, 0.0, 1.0)

# Edge detection
edges = img.filter(ImageFilter.FIND_EDGES)
edge_arr = np.array(edges, dtype=np.float32) / 255.0

out = Image.new('RGB', (w, h), (250, 248, 245))
draw = ImageDraw.Draw(out)

# 1. Background text (strictly outside subject)
phrases = ["I Love You", "Je t'aime", "Ich liebe dich", "Te amo", "我爱你", "愛してる", "أحبك", "Ti amo", "Eu te amo"]
p_idx = 0
for y in range(25, h - 25, 24):
    for x in range(25, w - 85, 80):
        sub_d = density[max(0, y-12):min(h, y+12), max(0, x-12):min(w, x+12)]
        if np.max(sub_d) < 0.1:
            draw.text((x, y), phrases[p_idx % len(phrases)], fill=(155, 155, 160))
            p_idx += 1

# 2. Individual curly loops (NO connecting horizontal lines!)
random.seed(42)
for y in range(35, h - 35, 7):
    for x in range(35, w - 35, 7):
        d = density[y, x]
        if d > 0.14:
            # Multi-loop spiral
            num_loops = int(1 + d * 3.5)
            r = 3.0 + (1.0 - d) * 7.5
            total_steps = 12 * num_loops

            pts = []
            angle_start = random.random() * math.pi * 2
            for s in range(total_steps):
                th = angle_start + s * 0.52
                # shrinking / expanding loop
                current_r = r * (0.8 + 0.3 * math.sin(s * 0.2))
                cx = x + math.cos(th) * current_r
                cy = y + math.sin(th) * current_r
                pts.append((cx, cy))

            if len(pts) > 1:
                draw.line(pts, fill=(20, 20, 24), width=1)

out.save('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/test-no-crosslines.png')
print("Saved test-no-crosslines.png without crosslines!")
