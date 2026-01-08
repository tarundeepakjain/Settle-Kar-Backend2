import cv2
import pytesseract
import re

def extract(img):
    #Converting Image To B/W
    img = cv2.imread(img)
    grayBG = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(grayBG, 150, 255, cv2.THRESH_BINARY)[1] #Pixel Value> 150 -> 255 (White) #Pixel Value<150 -> 0(Black)
    text = pytesseract.image_to_string(thresh)
    '''cv2.imshow("Gray Image", grayBG)
    cv2.waitKey(0)  
    cv2.destroyAllWindows()'''

    findAmount = r'₹?\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)' #Finding the amounts by searching the Indian Currency

    amount = re.findall(findAmount, text)

    #Finding line where Total is Written
    Total=None 
    lines=text.splitlines()
    for line in lines:
        if 'total' in line.lower():
            Total=line
            break

    return {"Text" : text, "Amounts" : amount, "Total Amount" : Total}

Bill = extract("testBill.png")
print(Bill)

