# Solar System Simulation (TypeScript & Three.js)

## Live Demo

🚀 **[View the live simulation here!](https://happitack.github.io/SolarSys/)** 🚀

*(Note: Please allow a moment for initial loading)*

---

## Description

This project is a physically-based N-body simulation of our solar system, built using TypeScript and the Three.js library for 3D rendering. It aims to model the gravitational interactions between the Sun and the eight planets, calculating their orbits using the Velocity Verlet integration method for reasonable physical accuracy and stability.

The primary goal is to serve as a portfolio piece demonstrating skills in TypeScript, 3D graphics with Three.js, physics simulation implementation, code structuring, front-end development tooling (Vite), and basic UI interaction.

## Features (Current)

* **N-Body Simulation:** Calculates gravitational forces between all included celestial bodies.
* **8 Planets + Sun:** Includes the Sun and all eight planets of our solar system.
* **Kinematic Moon:** Earth's Moon follows a predefined circular path relative to Earth for visual stability.
* **Velocity Verlet Integration:** Uses a stable numerical integration method for calculating motion.
* **Scaled Distances:** Orbital distances are scaled up from realistic AU values for better visualization. Initial velocities are calculated based on these scaled distances.
* **Planet Texturing:** Applies surface textures to the Sun and planets.
* **Axial Tilt:** Simulates the approximate axial tilt of each planet relative to the orbital plane.
* **Planetary Rotation:** Simulates the visual rotation of planets on their tilted axes.
* **Dynamic Orbit Trails:** Visual trails follow each planet, showing its recent path. Uses pre-allocated buffers for efficiency.
* **Starfield Background:** Displays a star map on an inverted skysphere surrounding the scene.
* **3D Visualization:** Renders the system in 3D using Three.js.
* **UI Time Controls:** Allows pausing/resuming the simulation and adjusting its speed via a slider.
* **UI Orbit Trail Toggle:** Allows showing/hiding the orbit trails via a checkbox.

## Technologies Used

* **TypeScript:** For type safety and modern JavaScript features.
* **Three.js:** For 3D rendering via WebGL.
* **Vite:** As the build tool and development server.
* **Node.js / npm:** For package management.

## Setup and Running

To run this simulation locally, follow these steps:

1.  **Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) (which includes npm) installed on your system.
2.  **Clone Repository:** Clone this project repository to your local machine using Git:
    ```bash
    git clone [https://github.com/Happitack/SolarSys](https://github.com/Happitack/SolarSys)
    cd SolarSys
    ```
3.  **Install Dependencies:** Open a terminal in the project's root directory and run:
    ```bash
    npm install
    ```
4.  **Run Development Server:** Start the Vite development server:
    ```bash
    npm run dev
    ```
5.  **View Simulation:** Open your web browser and navigate to the local URL provided by Vite (usually `http://localhost:5173` or similar).

## Controls

* **Rotate View:** Left-click and drag.
* **Zoom:** Use the mouse scroll wheel.
* **Pan:** Right-click and drag (or Ctrl/Cmd + Left-click and drag).
* **Pause/Play Buttons:** Pause or resume the simulation time.
* **Speed Slider:** Control the rate at which simulation time passes (adjusts `dt` multiplier).
* **Show Orbits Checkbox:** Toggle the visibility of the planet orbit trails.

## Known Issues

* **Long-Term Stability:** Due to the nature of numerical integration (using a fixed-timestep Velocity Verlet method), tiny errors can accumulate over very long simulated periods or when using high speed multipliers. This can lead to:
    * Slight drifting of the entire system's center of mass.
    * Eventual decay or instability in the orbits of inner planets (like Mercury) after extremely long simulation times.
* **Moon Physics:** Earth's Moon uses a kinematic (predefined circular path) orbit relative to Earth for visual stability, not a full N-body physics calculation. Achieving stable N-body moon simulation requires high-precision initial condition data or more advanced integration techniques. I hope to revisit this later when I have more knowledge/information about the subject

## Planned Changes (Ideas)

* **Display Information:** Show details about selected bodies (name, mass, speed, distance).
* **Moons:** Add moons for all relevant planetary bodies.
* **Saturn's Rings:** Add a visual representation of Saturn's rings.
* **UI Enhancements:** More refined UI controls or presentation.
* **Custom Shaders:** Implement custom shaders for effects like bloom around the Sun/bright objects, planetary atmospheres, etc.

