from flask import Flask, render_template, Response
import cv2
import os
import numpy as np

app = Flask(__name__)

def distance(v1, v2):
    return np.sqrt(((v1-v2)**2).sum())

def knn(train, test, k=5):
    dist = []
    
    for i in range(train.shape[0]):
        
        ix = train[i, :-1]
        iy = train[i, -1]
        
        d = distance(test, ix)
        dist.append([d, iy])
        
    dk = sorted(dist, key=lambda x: x[0])[:k]
    labels = np.array(dk)[:, -1]
    
    output = np.unique(labels, return_counts=True)
    index = np.argmax(output[1])
    
    return output[0][index]

face_cascade_path = "Face-Recognition/haarcascade_frontalface_alt.xml"
face_cascade = cv2.CascadeClassifier(face_cascade_path)

if face_cascade.empty():
    raise IOError(f"Cannot load cascade file '{face_cascade_path}'")

dataset_path = "Face-Recognition/face-data/"

face_data = []
labels = []
class_id = 0
names = {}

for fx in os.listdir(dataset_path):
    if fx.endswith('.npy'):
        names[class_id] = fx[:-4] 
        data_item = np.load(os.path.join(dataset_path, fx))
        face_data.append(data_item)
        
        target = class_id * np.ones((data_item.shape[0],))
        class_id += 1
        labels.append(target)
        
face_datasets = np.concatenate(face_data, axis=0)
face_labels = np.concatenate(labels, axis=0).reshape((1, -1))
print(face_labels.shape)
print(face_datasets.shape)

trainset = np.concatenate((face_datasets, face_labels.T), axis=1)
print(trainset.shape)

font = cv2.FONT_HERSHEY_SIMPLEX

detected_names = set()

def gen_frames():
    cap = cv2.VideoCapture(0)
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_flip = cv2.flip(frame, 1)
        
        gray = cv2.cvtColor(frame_flip, cv2.COLOR_BGR2GRAY)
        
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            detected_names.add("No one arrive")
        
        for face in faces:
            x, y, w, h = face
            
            offsets = 5
            face_offsets = frame_flip[y-offsets: y+h+offsets, x-offsets: x+w+offsets]
            face_section = cv2.resize(face_offsets, (100, 100))
            
            out = knn(trainset, face_section.flatten())
            
            detected_name = names[int(out)]
            detected_names.add(detected_name)
            
            cv2.putText(frame_flip, detected_name, (x, y-10), font, 1, (255, 0, 0), 2, cv2.LINE_AA)
            cv2.rectangle(frame_flip, (x, y), (x+w, y+h), (255, 255, 255), 2)
        
        ret, buffer = cv2.imencode('.jpg', frame_flip)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        # cv2.imshow("Faces", frame_flip)
        # if cv2.waitKey(1) & 0xFF == ord(';'):
        #     break
    
        cap.release()
        # cv2.destroyAllWindows()
        
@app.route('/')
def index():
    return render_template('Face-Recognition/template/index.html')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames())


if "No one arrive" in detected_names:
    detected_names.remove("No one arrive")
    if len(detected_names) == 0:
        detected_names.add("No one arrive")
        
for name in detected_names:
    if name == "No one arrive":
        print(name)
    else:
        print(f"{name}, already arrive")