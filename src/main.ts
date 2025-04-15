import { updateBodies } from './simulation/Physics'; 
import * as config from './config';
import { setupSceneGraph } from './rendering/sceneSetup';
import { SolarSystem } from './simulation/SolarSystem';
import { setupUIControls } from './ui/uiControls';

// --- Initialize Core Components ---
const { scene, camera, renderer, pointLight, controls } = setupSceneGraph();

// --- Append Renderer to DOM & Start Loop ---
document.body.appendChild(renderer.domElement);
renderer.setAnimationLoop(animate);

// --- Create the Solar System ---
const solarSystem = new SolarSystem(scene, pointLight);

// --- Setup UI Controls ---
const uiState = setupUIControls(solarSystem);

// --- Animation Loop ---
function animate() {
    controls.update();

    // Check pause state using the function returned from setupUIControls
    if (!uiState.isPaused()) {
        const effectiveDt = config.DT * uiState.getTimeScale();

        updateBodies(solarSystem.bodies, effectiveDt);

        solarSystem.updateVisuals(effectiveDt);
    }

    renderer.render(scene, camera);
}