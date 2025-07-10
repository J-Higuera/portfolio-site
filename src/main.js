// Import other site scripts
import './about.js';
import './contact.js';
import './index.js';
import './mobile-nav.js';
import './projects.js';
import './scroll.js';
import './theme.js';

// Import Three.js and GLTFLoader properly
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

console.log('Three.js is loaded:', THREE);

// === SETUP ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.z = 5; // Set once

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('scene-container').appendChild(renderer.domElement);

// === SIMPLE TEST CUBE ===
const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const material = new THREE.MeshStandardMaterial({ color: 0x00ffff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// === LIGHT ===
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 2);
scene.add(light);

// === LOAD GLTF MODEL ===
const loader = new GLTFLoader();
loader.load(
    '/models/sci_fi_containers_kit.glb',
    (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5); // Adjust scale
        model.position.set(0, 0, 0);    // Adjust position if needed
        scene.add(model);
        console.log('GLTF model loaded:', model);
    },
    undefined,
    (error) => {
        console.error('Error loading GLTF model:', error);
    }
);

// === ANIMATION LOOP ===
function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();

// === HANDLE RESIZE ===
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

