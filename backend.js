const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
const faceapi = require('@vladmandic/face-api');
const canvas = require('canvas');
const ws = require('ws');

const URL = 'http://localhost:8000'

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const canvasElement = canvas.createCanvas(640, 480);
const ctx = canvasElement.getContext('2d');
const img = new Image();
const wss = new ws.WebSocketServer({port: 8080});


// img.onload = async () => {
//   console.log('Image loaded');
//   ctx.drawImage(img, 0, 0);
//
//   // face detection code 
//   let result = await detectFace(img);
//   console.log("detected!");
// }
//
// img.onerror = (error) => {
//   console.log("Error loading image:", error);
// }   

async function processImageData(imgData) {
  img.src = imgData.toString('utf-8');
  const results = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();
  return results;
}

wss.on('connection', (ws) => {
  console.log('Connected Successfully');
  ws.on('message', async (imgData) => {
    const detections = await processImageData(imgData);
    if (detections) {
      console.log('Image Processed!');
    } else {
      console.error('Failed to process correctly');
    }
  });
});

async function main() {
  await faceapi.loadFaceRecognitionModel(`${URL}/models`);
  await faceapi.loadSsdMobilenetv1Model(`${URL}/models`);
  await faceapi.loadFaceLandmarkModel(`${URL}/models`);


}

main();
