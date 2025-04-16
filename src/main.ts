import * as THREE from 'three';
import { updateBodies } from './simulation/Physics';
import * as config from './config';
import { setupSceneGraph } from './rendering/sceneSetup';
import { SolarSystem } from './simulation/SolarSystem';
import { CelestialBody, KinematicMoon } from './simulation/CelestialBody';
import { setupUIControls } from './ui/uiControls';
import { setupInfoPanel } from './ui/infoPanel';

// --- Initialize Core Components ---
const { scene, camera, renderer, pointLight, controls } = setupSceneGraph();

// --- Store original control limits ---
const originalMinDistance = controls.minDistance;
const originalMaxDistance = controls.maxDistance;

// --- Append Renderer to DOM & Start Loop ---
document.body.appendChild(renderer.domElement);
renderer.setAnimationLoop(animate);

// --- Create the Solar System ---
const solarSystem = new SolarSystem(scene, pointLight);

// --- Setup UI Controls (Pause, Speed, Trails) ---
const uiState = setupUIControls(solarSystem);

// --- Selection State ---
let selectedObject: CelestialBody | KinematicMoon | null = null;
let isCameraLocked = false;

// --- Setup Info Panel ---
const infoPanelControls = setupInfoPanel(() => {
    deselectObject();
});

// --- Raycasting Setup ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// --- Helper Functions ---

function selectObject(object: CelestialBody | KinematicMoon) {
    if (object === selectedObject) return;

    deselectObject();

    selectedObject = object;
    isCameraLocked = true;
    console.log('Selected:', selectedObject.name);

    // --- Common Setup ---
    const targetMesh = selectedObject.mesh;
    const targetPosition = targetMesh.position;
    const objectRadius = (targetMesh.geometry as THREE.SphereGeometry).parameters.radius;

 let distanceFactor: number;
    let minZoomDist: number;
    let maxZoomDistFactor: number;

    // Check if the selected object is a KinematicMoon
    if ('orbitRadius' in object) { 
        distanceFactor = 15; // 
        minZoomDist = objectRadius * 1.5; 
        maxZoomDistFactor = 50; 
        console.log(`Moon selected (${object.name}), using distance factor: ${distanceFactor}`);} 
        // or if it's a CelestialBody
        else { 
        distanceFactor = 4; 
        minZoomDist = objectRadius * 0.5; 
        maxZoomDistFactor = 10; 
        console.log(`Planet selected (${object.name}), using distance factor: ${distanceFactor}`);
    }

    // --- Calculate initial camera position ---
    const desiredDistance = Math.max(objectRadius * distanceFactor, minZoomDist + 0.05); // Ensure slightly > minZoom
    const currentCamDirection = new THREE.Vector3().subVectors(targetPosition, camera.position).normalize();
    const initialOffset = currentCamDirection.multiplyScalar(-desiredDistance);
    const initialCameraPosition = new THREE.Vector3().copy(targetPosition).add(initialOffset);

    // --- Move Camera Instantly ---
    camera.position.copy(initialCameraPosition);

    // --- Adjust Controls using calculated values ---
    controls.enablePan = false;
    controls.enableRotate = true;
    controls.minDistance = minZoomDist; // Use calculated min distance
    controls.maxDistance = desiredDistance * maxZoomDistFactor; // Use calculated max distance factor
    controls.target.copy(targetPosition);
    controls.update(); // Apply changes

    // Update info panel
    infoPanelControls.update(selectedObject, solarSystem);
}

function deselectObject() {
    if (!selectedObject) return; 

    console.log('Deselected:', selectedObject.name);
    selectedObject = null;
    isCameraLocked = false;

    // Restore Controls
    controls.enablePan = true;
    controls.minDistance = originalMinDistance;
    controls.maxDistance = originalMaxDistance;

    infoPanelControls.hide();
}


// --- Event Listener for Clicks ---
function onPointerDown(event: PointerEvent) {
    const clickedElement = event.target as Element;
    if (clickedElement.closest('#info-panel') || clickedElement.closest('#controls')) {
         return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersectableMeshes: THREE.Mesh[] = [];
    solarSystem.bodies.forEach(body => {
        intersectableMeshes.push(body.mesh); 
        if (body.childMoons) {
            body.childMoons.forEach(moon => {
                intersectableMeshes.push(moon.mesh);
            });
        }
    });

    const intersects = raycaster.intersectObjects(intersectableMeshes);

    if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object as THREE.Mesh;
        let newlySelected: CelestialBody | KinematicMoon | null = null;

        newlySelected = solarSystem.bodies.find(body => body.mesh === intersectedMesh) || null;

        if (!newlySelected) {
            for (const body of solarSystem.bodies) {
                if (body.childMoons) {
                    const foundMoon = body.childMoons.find(moon => moon.mesh === intersectedMesh);
                    if (foundMoon) {
                        newlySelected = foundMoon;
                        break;
                    }
                }
            }
        }

        if (newlySelected) {
            if (newlySelected instanceof CelestialBody && newlySelected.name === 'Sun') {
                 deselectObject(); 
                 controls.target.set(0,0,0); 
                 console.log("Focused on Sun");
            } else {
                 selectObject(newlySelected); 
            }
        }
    } else {  
        if (!isCameraLocked && selectedObject) {
           deselectObject(); 
        }
    }
}
renderer.domElement.addEventListener('pointerdown', onPointerDown);

// --- Animation Loop ---
const currentCameraOffset = new THREE.Vector3(); // Reuse vector

function animate() {
    let currentTargetPosition: THREE.Vector3 | null = null;
    if (isCameraLocked && selectedObject) {
         currentTargetPosition = selectedObject.mesh.position;
    }

    currentCameraOffset.subVectors(camera.position, controls.target);

    if (isCameraLocked && currentTargetPosition) {
        controls.target.copy(currentTargetPosition);
    }

    controls.update();

    if (isCameraLocked && currentTargetPosition) {
        camera.position.copy(controls.target).add(currentCameraOffset);
    }

    // --- Simulation Update ---
    if (!uiState.isPaused()) {
        const effectiveDt = config.DT * uiState.getTimeScale();
        updateBodies(solarSystem.bodies, effectiveDt);
        solarSystem.updateVisuals(effectiveDt);

        if (infoPanelControls.isVisible() && selectedObject) {
            infoPanelControls.update(selectedObject, solarSystem);
        }
    }

    renderer.render(scene, camera);
}