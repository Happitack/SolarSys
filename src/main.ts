import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CelestialBody } from './simulation/CelestialBody';
import { updateBodies, G } from './simulation/physics';

// --- Simulation Constants ---
const dt = 0.1; // Delta time step for simulation (fraction of a year)
const distanceScale = 10;
const sunVisualRadius = 0.3; // Base visual size for the Sun
const MAX_TRAIL_POINTS = 11500 // Maximum number of points in the trail

// --- Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// --- Lighting ---
const ambientLight = new THREE.AmbientLight( 0x606060 ); 
scene.add( ambientLight );
const pointLight = new THREE.PointLight( 0xffffff, 1.5, 0, 1 );
scene.add( pointLight );

// --- Celestial Bodies ---
// Define visual radii directly for a sensible appearance, NOT based on physical reality.
const bodies: CelestialBody[] = [];
const orbitLines = new Map<CelestialBody, THREE.Line>();

// Helper function to create a planet
function createPlanetBody(name: string, mass: number, position: THREE.Vector3, velocity: THREE.Vector3, color: number, visualRadius: number): CelestialBody {
    const geometry = new THREE.SphereGeometry(visualRadius, 32, 16);
    const material = new THREE.MeshPhongMaterial({ color: color, shininess: 10 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    // Creates the body, associating it with the mesh
    const body = new CelestialBody(name, mass, position, velocity, mesh);
    return body; // Return the created body
}

// Sun
const sunGeometry = new THREE.SphereGeometry(sunVisualRadius, 32, 16);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
const sunMass = 1.0;
const sun = new CelestialBody('Sun', 1.0, new THREE.Vector3(0, 0 ,0), new THREE.Vector3(0, 0, 0), sunMesh);
scene.add(sunMesh);
bodies.push(sun);
pointLight.position.copy(sun.position);

const planetsData = [
    // Name, Mass (Solar), Orbit Radius (a, AU), Color, Visual Radius (arbitrary units)
    { name: 'Mercury', mass: 1.65e-7, a: 0.39, color: 0xAAAAAA, visualRadius: 0.03 },
    { name: 'Venus',   mass: 2.45e-6, a: 0.72, color: 0xD4A017, visualRadius: 0.05 },
    { name: 'Earth',   mass: 3.00e-6, a: 1.00, color: 0x0000FF, visualRadius: 0.05 },
    { name: 'Mars',    mass: 3.23e-7, a: 1.52, color: 0xFF4500, visualRadius: 0.04 },
    { name: 'Jupiter', mass: 9.55e-4, a: 5.20, color: 0xFFD700, visualRadius: 0.18 },
    { name: 'Saturn',  mass: 2.86e-4, a: 9.58, color: 0xF4A460, visualRadius: 0.16 },
    { name: 'Uranus',  mass: 4.37e-5, a: 19.20, color: 0xADD8E6, visualRadius: 0.12 },
    { name: 'Neptune', mass: 5.15e-5, a: 30.05, color: 0x00008B, visualRadius: 0.12 },
];

// --- Create Planets AND their Orbit Lines ---
planetsData.forEach(p => {
    const scaled_a = p.a * distanceScale;
    const recalculated_v = Math.sqrt(G * sunMass / scaled_a);

    // Create the CelestialBody object using the corrected helper
    const planetBody = createPlanetBody( // Use corrected function name
        p.name, p.mass,
        new THREE.Vector3(scaled_a, 0, 0), new THREE.Vector3(0, recalculated_v, 0),
        p.color, p.visualRadius
    );
    scene.add(planetBody.mesh);
    bodies.push(planetBody);

    // Create the orbit line object
    const orbitGeometry = new THREE.BufferGeometry();

    // --- Pre-allocate buffer ---
    const positions = new Float32Array(MAX_TRAIL_POINTS * 3);
    const positionAttribute = new THREE.BufferAttribute(positions, 3);
    orbitGeometry.setAttribute('position', positionAttribute);

    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xAAAAAA , transparent: true, opacity: 0.1 }); 
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbitLine);
    orbitLines.set(planetBody, orbitLine);
});

// --- Camera Position ---
camera.position.set( 0, 150, 350);
camera.lookAt( scene.position );

// --- Controls ---
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05;
controls.minDistance = 1;
controls.maxDistance = 5000;

// --- Animation Loop ---
function animate() {
    controls.update();
    updateBodies( bodies, dt );

    bodies.forEach( body => {
        body.mesh.position.copy( body.position );

        if (body.name === 'Sun') {
            pointLight.position.copy(body.position);
        } else {
            // Update Orbit Trail
            body.pathPoints.push(body.position.clone());
            if (body.pathPoints.length > MAX_TRAIL_POINTS) {
                body.pathPoints.shift();
            }

            const line = orbitLines.get(body);
            if (line && body.pathPoints.length > 1) {

                // --- Update pre-allocated buffer ---
                const geometry = line.geometry;
                const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;

                // Copy points from pathPoints array into the buffer attribute's array
                for (let i = 0; i < body.pathPoints.length; i++) {
                    const point = body.pathPoints[i];
                    positionAttribute.array[i * 3 + 0] = point.x;
                    positionAttribute.array[i * 3 + 1] = point.y;
                    positionAttribute.array[i * 3 + 2] = point.z;
                }

                // Tell Three.js how many points to draw (important!)
                geometry.setDrawRange(0, body.pathPoints.length);
                positionAttribute.needsUpdate = true;
                geometry.computeBoundingSphere();

            }
        }
    });

    renderer.render( scene, camera );
}

// --- Handle Window Resize ---
window.addEventListener( 'resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
});

