import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import math
import random

# 1. Generate line sketch
img = cv2.imread('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/person-preview.jpg')
h, w = img.shape[:2]
target_w, target_h = 600, int(600 * (h / w))
img = cv2.resize(img, (target_w, target_h))

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
inv = 255 - gray
blur = cv2.GaussianBlur(inv, (15, 15), 0)
sketch = cv2.divide(gray, 255 - blur, scale=256)
sketch = cv2.multiply(sketch, sketch, scale=1.0/255.0)

# Convert to PIL
sketch_pil = Image.fromarray(sketch).convert('RGBA')

# Create warm textured paper canvas
canvas_w, canvas_h = 800, 1000
out = Image.new('RGB', (canvas_w, canvas_h), (251, 249, 245))
draw = ImageDraw.Draw(out)

# 2. Draw multilingual background text (in margin only)
phrases = ["I Love You", "Je t'aime", "Ich liebe dich", "Te amo", "我爱你", "愛してる", "أحبك", "मैं तुमसे प्यार करता हूँ"]
p_idx = 0
for y in range(40, canvas_h - 40, 36):
    for x in range(30, canvas_w - 90, 85):
        # Only in outer margins
        if x < (canvas_w - target_w)/2 - 20 or x > (canvas_w + target_w)/2 + 20 or y < (canvas_h - target_h)/2 - 20 or y > (canvas_h + target_h)/2 + 20:
            draw.text((x, y), phrases[p_idx % len(phrases)], fill=(160, 160, 165))
            p_idx += 1

# Paste sketch centered
pos_x = (canvas_w - target_w) // 2
pos_y = (canvas_h - target_h) // 2
out.paste(sketch_pil, (pos_x, pos_y))

# 3. Add organic curly scribble loops in the dark hair & shadow regions
shadow_mask = gray < 130
random.seed(100)
for y in range(10, target_h - 10, 8):
    for x in range(10, target_w - 10, 8):
        if shadow_mask[y, x]:
            darkness = (130 - gray[y, x]) / 130.0
            r = 3.0 + (1.0 - darkness) * 5.0
            steps = int(12 + darkness * 16)
            pts = []
            th_start = random.random() * math.pi * 2
            for s in range(steps):
                th = th_start + s * 0.55
                cx = pos_x + x + math.cos(th) * r
                cy = pos_y + y + math.sin(th) * r
                pts.append((cx, cy))
            if len(pts) > 1:
                draw.line(pts, fill=(15, 15, 20), width=1)

out.save('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/test-combined-perfect.png')
print("Combined perfect sketch + scribble saved!")
