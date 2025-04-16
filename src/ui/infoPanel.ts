import type { SolarSystem } from '../simulation/SolarSystem';
import type { CelestialBody } from '../simulation/CelestialBody';

// Interface defining the functions returned by setupInfoPanel
export interface InfoPanelControls {
    update: (body: CelestialBody | null, solarSystem: SolarSystem) => void;
    hide: () => void;
    isVisible: () => boolean;
}

// Function to set up the info panel and return control functions
export function setupInfoPanel(onCloseCallback: () => void): InfoPanelControls {

    // --- Get UI Element References ---
    const infoPanel = document.getElementById('info-panel');
    const infoName = document.getElementById('info-name');
    const infoMass = document.getElementById('info-mass');
    const infoDistanceSun = document.getElementById('info-distance-sun');
    const infoVelocity = document.getElementById('info-velocity');
    const closeInfoBtn = document.getElementById('close-info-btn');

    let visible = false;

    // --- Panel Update Logic ---
    function update(body: CelestialBody | null, solarSystem: SolarSystem) {
        if (body && infoPanel && infoName && infoMass && infoDistanceSun && infoVelocity) {
            infoName.textContent = body.name; // [cite: uploaded:src/simulation/CelestialBody.ts]
            infoMass.textContent = body.mass.toExponential(2); // [cite: uploaded:src/simulation/CelestialBody.ts]

            // Calculate current distance from Sun (body 0) and velocity magnitude
            if (body.name !== 'Sun') {
                // Ensure solarSystem and its bodies are available
                if (solarSystem && solarSystem.bodies.length > 0) { // [cite: uploaded:src/simulation/SolarSystem.ts]
                    const sun = solarSystem.bodies[0]; // Assuming Sun is always the first body [cite: uploaded:src/simulation/SolarSystem.ts]
                    const distanceFromSun = body.position.distanceTo(sun.position); // Using physics position [cite: uploaded:src/simulation/CelestialBody.ts]
                    const velocityMag = body.velocity.length(); // Using physics velocity [cite: uploaded:src/simulation/CelestialBody.ts]
                    infoDistanceSun.textContent = distanceFromSun.toFixed(2);
                    infoVelocity.textContent = velocityMag.toFixed(3);
                } else {
                    // Handle case where solarSystem might not be fully initialized yet or Sun is missing
                    infoDistanceSun.textContent = '-';
                    infoVelocity.textContent = '-';
                }
            } else {
                // Special case for the Sun
                infoDistanceSun.textContent = '0.00';
                infoVelocity.textContent = '0.000';
            }

            infoPanel.style.display = 'block'; // Show the panel
            visible = true;
        } else {
            // If body is null or elements are missing, hide the panel
            hide();
        }
    }

    // --- Panel Hide Logic ---
    function hide() {
        if (infoPanel) {
            infoPanel.style.display = 'none'; // Hide the panel
        }
        visible = false;
    }

    // --- Close Button Listener ---
    if (closeInfoBtn) {
        closeInfoBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from bubbling up to the canvas
            hide();
            onCloseCallback(); // Notify main.ts (or caller) that panel was closed
            console.log('Info panel closed via button');
        });
    } else {
        console.error("Info panel close button not found!");
    }

    // Initial setup: hide panel
    hide();

    // Return the control functions
    return {
        update,
        hide,
        isVisible: () => visible
    };
}