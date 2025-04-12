// --- Simulation Constants ---
export const DT = 0.001; // Delta time step (fraction of a year) - Uppercase convention for exported constants
export const DISTANCE_SCALE = 5.0; // Factor to scale orbital distances for visualization
export const MAX_TRAIL_POINTS = 16384; // Max points in orbit trails
export const VISUAL_ROTATION_SCALE_FACTOR = 5.0 // Factor to scale visual rotation speed for planets

// --- Body Properties ---
export const SUN_MASS = 1.0; // Mass of the Sun in solar mass units
export const SUN_VISUAL_RADIUS = 1.0; // Visual radius for the Sun
export const SUN_TEXTURE_FILE = 'textures/sun.jpg'; 

// --- Planet Data ---
export interface PlanetData {
    name: string;
    mass: number; // Relative to Sun
    a: number;    // Semi-major axis in AU
    color: number; // fallback color
    visualRadius: number; // Arbitrary visual radius
    textureFile: string; // Texture file path
    axialTilt: number; // Axial tilt in degrees 
    rotationFactor: number; // Rotation speed factor 
}

export const PLANETS_DATA: PlanetData[] = [
    // Name, Mass (Solar), Orbit Radius (a, AU), Color, Visual Radius (arbitrary units), Texture File, Axial Tilt (degrees), Rotation Factor
    { name: 'Mercury', mass: 1.65e-7, a: 0.39, color: 0xAAAAAA, visualRadius: 0.03, textureFile: 'textures/mercury.jpg', axialTilt: 0.034, rotationFactor: 0.2 },
    { name: 'Venus',   mass: 2.45e-6, a: 0.72, color: 0xD4A017, visualRadius: 0.05, textureFile: 'textures/venus.jpg', axialTilt: 177.4, rotationFactor: -0.1  },
    { name: 'Earth',   mass: 3.00e-6, a: 1.00, color: 0x0000FF, visualRadius: 0.05, textureFile: 'textures/earth.jpg', axialTilt: 23.44, rotationFactor: 1.0  },
    { name: 'Mars',    mass: 3.23e-7, a: 1.52, color: 0xFF4500, visualRadius: 0.04, textureFile: 'textures/mars.jpg', axialTilt: 25.19, rotationFactor: 0.9  },
    { name: 'Jupiter', mass: 9.55e-4, a: 5.20, color: 0xFFD700, visualRadius: 0.18, textureFile: 'textures/jupiter.jpg', axialTilt: 3.13, rotationFactor: 2.5  },
    { name: 'Saturn',  mass: 2.86e-4, a: 9.58, color: 0xF4A460, visualRadius: 0.16, textureFile: 'textures/saturn.jpg', axialTilt: 26.73, rotationFactor: 2.3  },
    { name: 'Uranus',  mass: 4.37e-5, a: 19.20, color: 0xADD8E6, visualRadius: 0.12, textureFile: 'textures/uranus.jpg', axialTilt: 97.77, rotationFactor: 1.5  },
    { name: 'Neptune', mass: 5.15e-5, a: 30.05, color: 0x00008B, visualRadius: 0.12, textureFile: 'textures/neptune.jpg', axialTilt: 28.32, rotationFactor: 1.4  },
];
