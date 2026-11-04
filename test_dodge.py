import cv2
import numpy as np

img = cv2.imread('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/person-preview.jpg')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Color Dodge pencil sketch filter
inv = 255 - gray
blur = cv2.GaussianBlur(inv, (21, 21), 0)
sketch = cv2.divide(gray, 255 - blur, scale=256)

# Enhance contrast of the sketch
sketch = cv2.multiply(sketch, sketch, scale=1.0/255.0)

cv2.imwrite('C:/Users/yousa/.gemini/antigravity/scratch/multilingual-portrait/public/test-pencil-sketch.png', sketch)
print("Color dodge sketch saved successfully!")

