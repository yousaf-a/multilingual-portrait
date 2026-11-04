import numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageDraw
import cv2
import math

# Load person preview
img_bgr = cv2.imread('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/person-preview.jpg')
gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

# 1. Clean Line Art via Difference of Gaussians (DoG)
g1 = cv2.GaussianBlur(gray, (3, 3), 1.0)
g2 = cv2.GaussianBlur(gray, (9, 9), 3.0)
dog = cv2.divide(g1, g2, scale=255)

# Threshold to get clean sketch lines
_, sketch_lines = cv2.threshold(dog, 240, 255, cv2.THRESH_BINARY)
cv2.imwrite('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/test-dog-sketch.png', sketch_lines)

print("Saved test-dog-sketch.png")

