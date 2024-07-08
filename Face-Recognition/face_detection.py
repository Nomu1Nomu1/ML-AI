import cv2
import cv2.data
import numpy as np

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_alt.xml')
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    
    frame_flip = cv2.flip(frame, 1)
    
    gray_frame = cv2.cvtColor(frame_flip, cv2.COLOR_BGR2GRAY)
    
    if ret == False:
        continue
    
    faces = face_cascade.detectMultiScale(gray_frame, 1.3, 5)
    
    if len(faces) == 0:
        continue
    
    for face in faces[:1]:
        x, y, w, h = face
        
        offset = 5
        face_offset = frame_flip[y-offset: y+h+offset, x-offset: x+w+offset]
        face_selection = cv2.resize(face_offset, (100, 100))
        
        cv2.imshow("Face", face_selection)
        cv2.rectangle(frame_flip, (x, y), (x+w, y+h), (0, 255, 00), 2)
        
    cv2.imshow("Faces", frame_flip)
    
    keypressed = cv2.waitKey(1) & 0xFF
    
    if keypressed == ord(";"):
        break
    
cap.release()
cv2.destroyAllWindows()