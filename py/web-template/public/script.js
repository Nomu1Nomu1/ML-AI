const video = document.getElementById('video');
const captureButton = document.getElementById('captureButton');

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('models/'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models/'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models/'),
    faceapi.nets.faceExpressionNet.loadFromUri('models/')
]).then(startVideo);

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    );
}

video.addEventListener('play', async () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 100);
});

captureButton.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-'); // Replace : and . with - to make the filename safe
        const filename = `captured-image-${timestamp}.png`;

        const formData = new FormData();
        formData.append('image', blob, filename);
        
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    }, 'image/png');
});
