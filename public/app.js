import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const GLOBE_RADIUS = 80;
const MAX_POINTS = 5000;
let totalEventCount = 0;
let pointIndex = 0;

const eventCountEl = document.getElementById('event-count');
const activeNodesEl = document.getElementById('active-nodes');
const logListEl = document.getElementById('log-list');

const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030712, 0.002);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 220);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Globe setup
const globeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
const globeMat = new THREE.MeshPhongMaterial({ color: 0x0f172a, emissive: 0x020617, wireframe: true, transparent: true, opacity: 0.6 });
const globe = new THREE.Mesh(globeGeo, globeMat);
scene.add(globe);

const innerGeo = new THREE.SphereGeometry(GLOBE_RADIUS - 0.5, 32, 32);
const innerMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
scene.add(new THREE.Mesh(innerGeo, innerMat));

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
dirLight.position.set(200, 100, 150);
scene.add(dirLight);

// High-performance particle system
const positions = new Float32Array(MAX_POINTS * 3);
const colors = new Float32Array(MAX_POINTS * 3);
const particlesGeo = new THREE.BufferGeometry();
particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particlesMat = new THREE.PointsMaterial({ size: 2.5, vertexColors: true, transparent: true, opacity: 0.9 });
const particleSystem = new THREE.Points(particlesGeo, particlesMat);
scene.add(particleSystem);

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Listen to worker
const worker = new Worker('worker.js');
worker.onmessage = (e) => {
  const newEvents = e.data;
  const posAttr = particlesGeo.attributes.position;
  const colAttr = particlesGeo.attributes.color;

  newEvents.forEach((evt) => {
    totalEventCount++;
    const vec = latLngToVector3(evt.lat, evt.lng, GLOBE_RADIUS + 0.8);
    const idx = (pointIndex % MAX_POINTS) * 3;

    posAttr.array[idx] = vec.x; posAttr.array[idx + 1] = vec.y; posAttr.array[idx + 2] = vec.z;
    const color = new THREE.Color(evt.severity === 'CRITICAL' ? 0xf43f5e : 0x38bdf8);
    colAttr.array[idx] = color.r; colAttr.array[idx + 1] = color.g; colAttr.array[idx + 2] = color.b;

    pointIndex++;
    
    // UI Log Update
    const item = document.createElement('div');
    item.className = `log-item ${evt.severity}`;
    item.innerHTML = `<span>${evt.city}</span><strong>$${evt.value}</strong>`;
    logListEl.prepend(item);
    if (logListEl.children.length > 5) logListEl.removeChild(logListEl.lastChild);
  });

  posAttr.needsUpdate = true;
  colAttr.needsUpdate = true;
  eventCountEl.innerText = totalEventCount.toLocaleString();
  activeNodesEl.innerText = `${Math.min(pointIndex, MAX_POINTS)} / ${MAX_POINTS}`;
};

// Render Loop
function animate() {
  requestAnimationFrame(animate);
  globe.rotation.y += 0.0008;
  particleSystem.rotation.y += 0.0008;
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});