import cv2
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    
    
    if ret == False:
        continue
    
    frame_flip = cv2.flip(frame, 1)
    
    cv2.imshow("Video Frame", frame_flip)
    
    key_pressed = cv2.waitKey(1) & 0xFF
    
    if key_pressed == ord(';'):
        break
    
cap.release()
cv2.destroyAllWindows() 