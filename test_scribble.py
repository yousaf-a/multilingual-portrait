import numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageDraw
import math

# Load the sudhin art reference image
img = Image.open('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/sample-scribble.jpg').convert('L')
w, h = 400, 500
img = img.resize((w, h))

# Calculate edge map
edges = img.filter(ImageFilter.FIND_EDGES)
edges.save('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/test-edges.png')
print("Edges saved")
