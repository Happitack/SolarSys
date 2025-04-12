import { updateBodies } from './simulation/Physics';
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

// --- UI Control State Variables ---
let isPaused = false;
let timeScale = 1.0; 
let trailsVisible = true;

// --- UI Elements ---
const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement | null;
const playBtn = document.getElementById('playBtn') as HTMLButtonElement | null;
const speedSlider = document.getElementById('speedSlider') as HTMLInputElement | null;
const speedValue = document.getElementById('speedValue') as HTMLSpanElement | null;
const trailsCheckbox = document.getElementById('trailsCheckbox') as HTMLInputElement | null;

// --- Add Event Listeners ---

// Play/Pause functionality
if (pauseBtn && playBtn) {
    pauseBtn.addEventListener('click', () => {
        isPaused = true;
        pauseBtn.style.display = 'none'; // Hide Pause
        playBtn.style.display = 'inline'; // Show Play
    });

    playBtn.addEventListener('click', () => {
        isPaused = false;
        pauseBtn.style.display = 'inline'; // Show Pause
        playBtn.style.display = 'none'; // Hide Play
    });
} else {
    console.error("Play/Pause buttons not found!");
}

// Speed control functionality
if (speedSlider && speedValue) {
    // Initialize display
    speedValue.textContent = `${timeScale.toFixed(1)}x`;
    speedSlider.value = `${timeScale}`;

    speedSlider.addEventListener('input', () => {
        timeScale = parseFloat(speedSlider.value);
        speedValue.textContent = `${timeScale.toFixed(1)}x`;
    });
} else {
    console.error("Speed slider or value display not found!");
}

// Trails visibility functionality
if (trailsCheckbox) {
    trailsCheckbox.checked = trailsVisible;

    trailsCheckbox.addEventListener('change', () => {
        trailsVisible = trailsCheckbox.checked;
        solarSystem.setTrailsVisible(trailsVisible);
    });
} else {
    console.error("Trails checkbox not found!");
}

// --- Animation Loop ---
function animate() {
    controls.update(); 
    if (!isPaused) {
        const effectiveDt = config.DT * timeScale;
        updateBodies( solarSystem.bodies, effectiveDt ); 
        solarSystem.updateVisuals(effectiveDt);
    }

    // Render the scene
    renderer.render( scene, camera );
}

