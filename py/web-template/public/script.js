const video = document.getElementById('video');
const modal = document.getElementById('myModal');
const span = document.getElementsByClassName('close')[0];
const nameInput = document.getElementById('nameInput');
const startButton = document.getElementById('startButton');

let isCapturing = false;
let userName = '';

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('models/'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models/'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models/'),
    faceapi.nets.faceExpressionNet.loadFromUri('models/')
]).then(() => {
    startButton.disabled = false
});

startButton.addEventListener('click', () => {
    userName = nameInput.value.trim();

    if (userName) {
        startVideo();
    } else {
        alert("Please enter your name.");
    }
});

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    );

    video.addEventListener('play', async () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.append(canvas);
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);
    
        const interval = setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
    
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    
            if (detections.length > 0 && !isCapturing) {
                captureImage();
            }
        }, 1000);
    });
}

function captureImage() {
    isCapturing = true;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        const filename = `${userName}-captured-image-${timestamp}.png`;

        const formData = new FormData();
        formData.append('image', blob, filename);
        formData.append('name', userName)
        
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            modal.style.display = "block";
            setTimeout(() => {
                isCapturing = false;
                modal.style.display = "none";
            }, 30000);
        })
        .catch(error => {
            console.error('Error:', error);
            isCapturing = false;
        });
    }, 'image/png');
}

span.onclick = function() {
    modal.style.display = "none";
    isCapturing = false;
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        isCapturing = false;
    }
}
