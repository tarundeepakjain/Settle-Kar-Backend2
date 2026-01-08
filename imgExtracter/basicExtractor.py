#Simple Text Extraction

from PIL import Image
import pytesseract

image = Image.open("testBill.png")
text = pytesseract.image_to_string(image)

print("Extracted Text:",text)