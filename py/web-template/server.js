// const express = require('express');
// const bodyParser = require('body-parser');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const app = express();
// const port = 3000;

// // Create the images directory if it doesn't exist
// const imageDir = path.join(__dirname, 'images');
// if (!fs.existsSync(imageDir)) {
//     fs.mkdirSync(imageDir);
// }

// // Configure body-parser and multer
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'images/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname);
//     }
// });
// const upload = multer({ storage: storage });

// // Serve static files
// app.use(express.static(path.join(__dirname, 'public')));

// // Route to handle image upload
// app.post('/upload', upload.single('image'), (req, res) => {
//     res.send('Image uploaded successfully!');
// });

// app.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}`);
// });
