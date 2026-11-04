import cv2
import numpy as np
from PIL import Image, ImageDraw
import math
import random

# Load person preview
img = cv2.imread('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/person-preview.jpg')
h, w = img.shape[:2]
target_w, target_h = 800, int(800 * (h / w))
img = cv2.resize(img, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Multi-scale edge-preserving sketch
inv = 255 - gray
blur = cv2.GaussianBlur(inv, (11, 11), 0)
sketch = cv2.divide(gray, 255 - blur, scale=256)
# High dynamic range curve
sketch = cv2.pow(sketch / 255.0, 1.8) * 255.0
sketch = np.clip(sketch, 0, 255).astype(np.uint8)

cv2.imwrite('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/test-accurate-sketch.png', sketch)
print("Accurate sketch generated!")
