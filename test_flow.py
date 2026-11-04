import numpy as np
from PIL import Image, ImageFilter, ImageDraw
import math
import random

# Load person preview or sudhin reference
img = Image.open('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/person-preview.jpg').convert('L')
w, h = 400, 500
img = img.resize((w, h))

arr = np.array(img, dtype=np.float32) / 255.0
# Density: invert luminance
density = 1.0 - arr

# Contrast boost
density = np.clip((density - 0.15) / 0.7, 0.0, 1.0)
density = np.power(density, 1.4)

# Compute gradients
gy, gx = np.gradient(arr)

# Draw on white canvas
out = Image.new('RGB', (w, h), (250, 248, 245))
draw = ImageDraw.Draw(out)

# Seeded random walk along contours
num_strokes = 250
step_len = 3.5

for i in range(num_strokes):
    # Find a point with high density
    for _ in range(50):
        sx = random.randint(10, w - 10)
        sy = random.randint(10, h - 10)
        if density[sy, sx] > 0.15:
            break
    else:
        continue

    curr_x, curr_y = float(sx), float(sy)
    points = [(curr_x, curr_y)]
    angle = random.uniform(0, math.pi * 2)

    for step in range(120):
        ix, iy = int(curr_x), int(curr_y)
        if ix < 5 or ix >= w - 5 or iy < 5 or iy >= h - 5:
            break
        d = density[iy, ix]
        if d < 0.08:
            break

        # Flow along contour (perpendicular to gradient)
        dx_g = gx[iy, ix]
        dy_g = gy[iy, ix]
        mag = math.sqrt(dx_g * dx_g + dy_g * dy_g)

        if mag > 0.02:
            # Perpendicular vector
            tangent_angle = math.atan2(dx_g, -dy_g)
            angle = tangent_angle + (random.uniform(-0.3, 0.3))
        else:
            angle += random.uniform(-0.4, 0.4)

        # Curly loop radius based on density
        loop_r = max(2.0, min(9.0, 7.0 * (1.0 - d * 0.6)))
        theta = step * 0.85

        curr_x += math.cos(angle) * step_len + math.cos(theta) * loop_r * 0.4
        curr_y += math.sin(angle) * step_len + math.sin(theta) * loop_r * 0.4
        points.append((curr_x, curr_y))

    if len(points) > 2:
        draw.line(points, fill=(24, 24, 27), width=1)

out.save('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/test-flow-scribble.png')
print("Flow scribble generated!")

