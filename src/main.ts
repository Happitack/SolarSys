import * as THREE from 'three';
import { updateBodies } from './simulation/Physics'; 
import * as config from './config'; 
import { setupSceneGraph } from './rendering/sceneSetup'; 
import { SolarSystem } from './simulation/SolarSystem'; 
import { CelestialBody } from './simulation/CelestialBody';
import { setupUIControls } from './ui/uiControls';
import { setupInfoPanel } from './ui/infoPanel';

// --- Initialize Core Components ---
const { scene, camera, renderer, pointLight, controls } = setupSceneGraph();

// --- Append Renderer to DOM & Start Loop ---
document.body.appendChild(renderer.domElement);
renderer.setAnimationLoop(animate);

// --- Create the Solar System ---
const solarSystem = new SolarSystem(scene, pointLight);

// --- Setup UI Controls (Pause, Speed, Trails) ---
const uiState = setupUIControls(solarSystem);

// --- Selection State ---
let selectedBody: CelestialBody | null = null;

// --- Setup Info Panel ---
// Pass a callback function that allows the infoPanel module to tell main.ts to deselect the body
const infoPanelControls = setupInfoPanel(() => {
    if (selectedBody) {
        selectedBody = null; // Deselect when panel is closed via its button
        console.log('Deselected (panel closed)');
        // controls.enabled = true;
    }
});

// --- Raycasting Setup ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// --- Event Listener for Clicks ---
function onPointerDown(event: PointerEvent) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Get meshes of bodies to check for intersection
    const intersectableMeshes = solarSystem.bodies.map(body => body.mesh);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(intersectableMeshes);

    if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object;
        const newlySelected = solarSystem.bodies.find(body => body.mesh === intersectedMesh);

        if (newlySelected && newlySelected !== selectedBody) {
            selectedBody = newlySelected;
            console.log('Selected:', selectedBody.name);
            // Update panel using the imported controls
            infoPanelControls.update(selectedBody, solarSystem);
            controls.enablePan = false; // Disable panning when a body is selected
        }
        // If clicking the same body again, do nothing for now
    } else {
        // Clicked empty space
        if (selectedBody) {
            selectedBody = null;
            console.log('Deselected (clicked background)');
            // Hide panel using the imported controls
            infoPanelControls.hide();
            controls.enablePan = true; // Re-enable panning when no body is selected
        }
    }
}
renderer.domElement.addEventListener('pointerdown', onPointerDown);

// --- Animation Loop ---
function animate() {
    // Update orbit controls
    controls.update();

    // --- Camera Targeting ---
    if (selectedBody && selectedBody.name !== 'Sun') {
        controls.target.lerp(selectedBody.mesh.position, 0.1);
    } else if (selectedBody && selectedBody.name === 'Sun') {
        controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);
    }

    // --- Simulation Update ---
    if (!uiState.isPaused()) {
        const effectiveDt = config.DT * uiState.getTimeScale();
        updateBodies(solarSystem.bodies, effectiveDt);
        solarSystem.updateVisuals(effectiveDt);

        // --- Update Info Panel Data if Visible ---
        // Use the imported controls to check visibility and update
        if (infoPanelControls.isVisible() && selectedBody) {
            infoPanelControls.update(selectedBody, solarSystem); // Re-call update to refresh dynamic data
        }
    }

    // Always render the scene
    renderer.render(scene, camera);
}