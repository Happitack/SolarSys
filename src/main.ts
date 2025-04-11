import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CelestialBody } from './simulation/CelestialBody';
import { updateBodies } from './simulation/physics';

// --- Simulation Constants ---
const dt = 0.05; // Delta time step for simulation

// --- Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 2000 );
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// --- Lighting ---
const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambientLight );
const pointLight = new THREE.PointLight( 0xffffff, 300000 );
scene.add( pointLight );

// --- Celestial Bodies ---
const bodies: CelestialBody[] = [];

// Sun
const sunGeometry = new THREE.SphereGeometry( 10, 32, 16 );
const sunMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const sunMesh = new THREE.Mesh( sunGeometry, sunMaterial );
const sun = new CelestialBody(
    'Sun',
    10000, // mass 
    new THREE.Vector3( 0, 0, 0 ), // initial position
    new THREE.Vector3( 0, 0, 0 ), // initial velocity
    sunMesh
);
scene.add( sunMesh );
bodies.push( sun );
pointLight.position.copy( sun.position );

// Earth
const earthGeometry = new THREE.SphereGeometry( 2, 32, 16 );
const earthMaterial = new THREE.MeshPhongMaterial( { color: 0x0000ff } );
const earthMesh = new THREE.Mesh( earthGeometry, earthMaterial );
const earth = new CelestialBody('Earth',
    10,
    new THREE.Vector3( 150, 0, 0 ),
    new THREE.Vector3( 0, 8.2, 0 ),
    earthMesh
);
scene.add( earthMesh );
bodies.push( earth );

// Mars
const marsGeometry = new THREE.SphereGeometry( 1.5, 32, 16 );
const marsMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
const marsMesh = new THREE.Mesh( marsGeometry, marsMaterial );
const mars = new CelestialBody('Mars',
    5,
    new THREE.Vector3( 220, 0, 0 ),
    new THREE.Vector3( 0, 6.8, 0 ),
    marsMesh
);
scene.add( marsMesh );
bodies.push( mars );

// --- Camera Position ---
camera.position.z = 300;
camera.position.y = 50;
camera.lookAt( scene.position );

// --- Controls ---
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.5;
controls.minDistance = 50;
controls.maxDistance = 1000;

// --- Animation Loop ---
function animate() {
    // Update celestial bodies
    updateBodies( bodies, dt );

    // Update mesh positions
    bodies.forEach( body => {
        body.mesh.position.copy( body.position );
    });

    // Render the scene
    renderer.render( scene, camera );
}

// --- Handle Window Resize ---
window.addEventListener( 'resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
});

