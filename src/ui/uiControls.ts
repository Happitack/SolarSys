import type { SolarSystem } from '../simulation/SolarSystem';

export interface UIControlState {
    isPaused: () => boolean;
    getTimeScale: () => number;
}

export function setupUIControls(solarSystem: SolarSystem): UIControlState {
    let isPaused = false;
    let timeScale = 1.0;
    let trailsVisible = true;

    // --- Get UI Element References ---
    const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement | null;
    const playBtn = document.getElementById('playBtn') as HTMLButtonElement | null;
    const speedSlider = document.getElementById('speedSlider') as HTMLInputElement | null;
    const speedValue = document.getElementById('speedValue') as HTMLSpanElement | null;
    const trailsCheckbox = document.getElementById('trailsCheckbox') as HTMLInputElement | null;

    // --- Add Event Listeners ---
    if (pauseBtn && playBtn) {
        playBtn.style.display = 'none'; 
        pauseBtn.style.display = 'inline';

        pauseBtn.addEventListener('click', () => {
            isPaused = true;
            pauseBtn.style.display = 'none';
            playBtn.style.display = 'inline';
        });

        playBtn.addEventListener('click', () => {
            isPaused = false;
            pauseBtn.style.display = 'inline';
            playBtn.style.display = 'none';
        });
    } else {
        console.error("Play/Pause buttons not found!");
    }

    if (speedSlider && speedValue) {
        speedValue.textContent = `${timeScale.toFixed(1)}x`;
        speedSlider.value = `${timeScale}`;

        speedSlider.addEventListener('input', () => {
            timeScale = parseFloat(speedSlider.value);
            speedValue.textContent = `${timeScale.toFixed(1)}x`;
        });
    } else {
        console.error("Speed slider or value display not found!");
    }

    if (trailsCheckbox) {
        trailsCheckbox.checked = trailsVisible;
        trailsCheckbox.addEventListener('change', () => {
            trailsVisible = trailsCheckbox.checked;
            solarSystem.setTrailsVisible(trailsVisible);
        });
    } else {
        console.error("Trails checkbox not found!");
    }

    return {
        isPaused: () => isPaused,
        getTimeScale: () => timeScale,
    };
}