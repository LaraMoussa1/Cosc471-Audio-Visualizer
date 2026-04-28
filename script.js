import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Center Cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// Audio bars
const bars=[];
const barCount = 16;
for (let i = 0; i < barCount; i++) {
  const barGeometry = new THREE.BoxGeometry(0.25, 1, 0.25);
  const barMaterial = new THREE.MeshNormalMaterial();
  const bar=new THREE.Mesh(barGeometry, barMaterial);
  bar.position.x = (i-barCount/2) * 0.4;
  bar.position.y = -2;
  bars.push(bar);
  scene.add(bar);

// Audio setup
const audio = new Audio("song.mp3");

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();

const source = audioContext.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioContext.destination);

analyser.fftSize = 256;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Start music after click
document.addEventListener("click", () => {
  audioContext.resume();
  audio.play();
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  analyser.getByteFrequencyData(dataArray);

  let avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
  let scale = 1 + avg / 100;

cube.scale.set(scale, scale, scale);
cube.rotation.x += 0.01;
cube.rotation.y += 0.01;

// Make each bar react to a different frequency value
for (let i = 0; i < bars.length; i++){
  let value = dataArray[i]/50;
  bars[i].scale.y = Math.max(0.2, value);
  bars[i].position.y=-2+ bars[i].scale.y/2;
}
  renderer.render(scene, camera);
}
animate();

// Resize handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
