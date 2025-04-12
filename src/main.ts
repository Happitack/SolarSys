import * as THREE from 'three';
import { CelestialBody } from './simulation/CelestialBody';
import { updateBodies, G } from './simulation/Physics';
import * as config from './config';
import { setupSceneGraph } from './sceneSetup';
import { SolarSystem } from './simulation/SolarSystem';

// --- Initialize Core Components ---
const { scene, camera, renderer, pointLight, controls } = setupSceneGraph();

// --- Append Renderer to DOM & Start Loop ---
document.body.appendChild(renderer.domElement);
renderer.setAnimationLoop(animate);

// --- Initialize Solar System ---
const solarSystem = new SolarSystem(scene, pointLight);

// --- Animation Loop ---
function animate() {
    // Update controls 
    controls.update(); 

    // Update physics
    updateBodies( solarSystem.bodies, config.DT ); 

    // Update the visual representation (meshes, trails) based on the new physics state
    solarSystem.updateVisuals();

    // Render the scene
    renderer.render( scene, camera );
}

