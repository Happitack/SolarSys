import type { SolarSystem } from '../simulation/SolarSystem';
import type { CelestialBody, KinematicMoon } from '../simulation/CelestialBody';

const EARTH_MASS_IN_SOLAR = 3.00e-6; // Approximate mass of Earth in solar masses

// Interface defining the functions returned by setupInfoPanel
export interface InfoPanelControls {
    update: (body: CelestialBody | KinematicMoon | null, solarSystem: SolarSystem) => void;
    hide: () => void;
    isVisible: () => boolean;
}

export function setupInfoPanel(onCloseCallback: () => void): InfoPanelControls {
    // --- Get UI Element References ---
    const infoPanel = document.getElementById('info-panel');
    const infoName = document.getElementById('info-name') as HTMLHeadingElement | null; // Explicitly type if possible
    const infoMass = document.getElementById('info-mass') as HTMLSpanElement | null;
    const infoMassUnit = infoMass?.nextSibling; // Get the text node containing the unit ($M_{\odot}$)
    const infoDistanceSun = document.getElementById('info-distance-sun');
    const infoVelocity = document.getElementById('info-velocity');
    const closeInfoBtn = document.getElementById('close-info-btn');
    const infoDistanceSunLabel = infoDistanceSun?.parentElement?.querySelector('strong'); // Find label
    const infoVelocityLabel = infoVelocity?.parentElement?.querySelector('strong');     // Find label


    let visible = false;

    // --- Panel Update Logic ---
    function update(body: CelestialBody | KinematicMoon | null, solarSystem: SolarSystem) {
        if (!body || !infoPanel || !infoName || !infoMass || !infoMassUnit || !infoDistanceSun || !infoVelocity || !infoDistanceSunLabel || !infoVelocityLabel) {
            hide();
            return;
        }

        // --- Name and Mass Display Logic ---
        infoName.textContent = body.name
        const massValue = body.mass;
        let displayMass: string;
        let displayUnit: string;

        if (body.name === 'Sun') {
            displayMass = '1.0';
            displayUnit = 'Solar Mass'; // Use full name
        } else if (body.name === 'Earth') {
            displayMass = '1.0';
            displayUnit = 'Earth Masses';
        } else {
            // Calculate relative to Earth's mass
            const massInEarthUnits = massValue / EARTH_MASS_IN_SOLAR;
            // Use fixed notation with reasonable precision
            if (massInEarthUnits >= 10) { // For giants like Jupiter/Saturn
                displayMass = massInEarthUnits.toFixed(1);
            } else if (massInEarthUnits >= 0.1) { // For Mars etc.
                displayMass = massInEarthUnits.toFixed(2);
            } else { // For Moon, Mercury, Pluto
                displayMass = massInEarthUnits.toFixed(3);
            }
            displayUnit = 'Earth Masses';
        }

        infoMass.textContent = displayMass;
        // Update the unit text node directly
        infoMassUnit.textContent = ` ${displayUnit}`; // Add space before unit

        // --- Type Specific Properties ---
        if ('position' in body && 'velocity' in body) {
            infoDistanceSunLabel.textContent = 'Distance from Sun (AU):';
            infoVelocityLabel.textContent = 'Velocity (AU/yr):';

            if (body.name !== 'Sun') {
                if (solarSystem && solarSystem.bodies.length > 0) {
                    const sun = solarSystem.bodies[0];
                    const distanceFromSun = body.position.distanceTo(sun.position);
                    const velocityMag = body.velocity.length();
                    infoDistanceSun.textContent = distanceFromSun.toFixed(2);
                    infoVelocity.textContent = velocityMag.toFixed(3);
                } else {
                    infoDistanceSun.textContent = '-';
                    infoVelocity.textContent = '-';
                }
            } else {
                infoDistanceSun.textContent = '0.00';
                infoVelocity.textContent = '0.000';
            }
        } else if ('mesh' in body && 'orbitRadius' in body) {
            // Find the parent planet to calculate distance/velocity relative to it or the Sun
            let parentPlanet: CelestialBody | undefined;
            for (const planet of solarSystem.bodies) {
                if (planet.childMoons.includes(body)) { // Check if this moon belongs to the planet
                    parentPlanet = planet;
                    break;
                }
            }

            if (parentPlanet) {
                infoDistanceSunLabel.textContent = `Distance from ${parentPlanet.name} (Rel AU):`;
                infoVelocityLabel.textContent = `Orbit Speed (Rel AU/yr):`; // Use configured speed

                const distFromParent = body.mesh.position.distanceTo(parentPlanet.mesh.position);
                infoDistanceSun.textContent = distFromParent.toFixed(3); // Show distance from parent
                infoVelocity.textContent = body.orbitSpeed.toFixed(2); // Use the defined orbit speed
            } else {
                // Should not happen if moon exists, but handle defensively
                infoDistanceSunLabel.textContent = 'Distance from Parent:';
                infoVelocityLabel.textContent = 'Orbit Speed:';
                infoDistanceSun.textContent = '-';
                infoVelocity.textContent = '-';
            }

        } else {
            hide();
            return;
        }


        infoPanel.style.display = 'block';
        visible = true;
    }

    // --- Panel Hide Logic ---
    function hide() {
        if (infoPanel) {
            infoPanel.style.display = 'none';
        }
        visible = false;
    }

    // --- Close Button Listener ---
    if (closeInfoBtn) {
        closeInfoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hide();
            onCloseCallback();
            console.log('Info panel closed via button');
        });
    } else {
        console.error("Info panel close button not found!");
    }

    hide(); // Initially hidden

    return {
        update,
        hide,
        isVisible: () => visible
    };
}