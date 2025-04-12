# Solar System Simulation (TypeScript & Three.js)

## Description

This project is a physically-based N-body simulation of our solar system, built using TypeScript and the Three.js library for 3D rendering. It aims to model the gravitational interactions between the Sun and the eight planets, calculating their orbits using the Velocity Verlet integration method for reasonable physical accuracy and stability.

The primary goal is to serve as a portfolio piece demonstrating skills in TypeScript, 3D graphics with Three.js, physics simulation implementation, code structuring, and front-end development tooling (Vite).

## Features (Current)

* **N-Body Simulation:** Calculates gravitational forces between all included celestial bodies.
* **8 Planets + Sun:** Includes the Sun and all eight planets of our solar system.
* **Velocity Verlet Integration:** Uses a stable numerical integration method for calculating motion.
* **Scaled Distances:** Orbital distances are scaled up from realistic AU values for better visualization within the 3D scene. Initial velocities are calculated based on these scaled distances.
* **Dynamic Orbit Trails:** Visual trails follow each planet, showing its recent path based on the simulation. Trail length is currently fixed but uses pre-allocated buffers for efficiency.
* **3D Visualization:** Renders the system in 3D using Three.js.
* **Interactive Camera:** Uses Three.js `OrbitControls` to allow panning, zooming, and rotating the view.
* **Modular Code Structure:** Refactored into modules for configuration (`config.ts`), scene setup (`sceneSetup.ts`), simulation object management (`simulation/SolarSystem.ts`), physics logic (`simulation/physics.ts`), and main orchestration (`main.ts`).

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
    git clone https://github.com/Happitack/SolarSys
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

## Planned Changes (Ideas)

* Add a starfield background.
* Implement UI controls for simulation time (pause, speed).
* Implement UI controls for selection/focus of indiviudal bodies
* Display information about selected bodies.
* Implement variable-length orbit trails based on orbital period.
* Add moons (e.g., Earth's Moon).
* Implement more accurate physics using real astronomical data/units.
