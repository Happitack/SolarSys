import * as THREE from 'three';
import { CelestialBody } from './CelestialBody';


// --- Constants ---
/**
 * Gravitational Constant (G).
 * The value (approx (2*PI)^2) is chosen based on the simulation's unit system:
 * - Distance: Astronomical Units (AU)
 * - Mass: Solar Masses (M☉)
 * - Time: Years
 * This choice simplifies Kepler's Third Law (P² ≈ a³/M_total) for Sun-dominated orbits.
 * See: https://en.wikipedia.org/wiki/Kepler%27s_laws_of_planetary_motion#Third_law
 * See: https://en.wikipedia.org/wiki/Gravitational_constant#Astronomical_mechanics
 */

export const G = 39.478; // Approximately (2 * PI)^2 AU³ M☉⁻¹ Year⁻²
const EPSILON = 1e-6; // Small value to prevent division by zero during force calculations if bodies overlap.  

// --- Functions ---
/**
 * Calculates the gravitational force vector exerted BY body2 ON body1.
 * Implements Newton's Law of Universal Gravitation: F = G * (m1 * m2) / r^2
 * See: https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation
 * The resulting force vector points from body1 towards body2.
 * @param body1 The body experiencing the force.
 * @param body2 The body exerting the force.
 * @returns THREE.Vector3 The gravitational force vector ($F_{1 \leftarrow 2}$) acting on body1.
 */

function calculateGravitationalForce(body1: CelestialBody, body2: CelestialBody): THREE.Vector3 {
    // Calculate the vector pointing from body1's position to body2's position
    // and its squared length (distance squared).
    const distanceVector = new THREE.Vector3().subVectors(body2.position, body1.position);
    const distanceSquared = distanceVector.lengthSq();

    // Avoid division by zero or extremely large forces at very small distances
    if (distanceSquared < EPSILON) {
        return new THREE.Vector3(0, 0, 0); // Prevent division by zero
    }

    // Calculate the magnitude of the gravitational force using Newton's Law
    const forceMagnitude = (G * body1.mass * body2.mass) / distanceSquared;
    const forceVector = distanceVector.normalize().multiplyScalar(forceMagnitude);
    return forceVector;
}

/**
 * Calculates the total gravitational force acting on each body in the system.
 * Applies the principle of superposition for N-body interactions and Newton's Third Law.
 * See: https://en.wikipedia.org/wiki/N-body_problem
 * See: https://en.wikipedia.org/wiki/Newton%27s_laws_of_motion#Newton's_3rd_law
 * @param bodies Array of all CelestialBody objects in the simulation.
 * @returns Map<CelestialBody, THREE.Vector3> A map linking each body to the net force vector acting upon it.
 */

function calculateAllForces(bodies: CelestialBody[]): Map<CelestialBody, THREE.Vector3> {
    const forces: Map<CelestialBody, THREE.Vector3> = new Map();
    bodies.forEach(body => {
        forces.set(body, new THREE.Vector3(0, 0, 0));
    });

    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            const body1 = bodies[i];
            const body2 = bodies[j];
            const force = calculateGravitationalForce(body1, body2);
            forces.get(body1)?.add(force); // Add force to object 1
            forces.get(body2)?.sub(force); // Add equal and opposite force to object 2
        }
    }
    return forces;
}

/**
 * Updates the position and velocity of all celestial bodies for one time step `dt`.
 * Uses the Velocity Verlet integration algorithm, a common and stable method for N-body simulations.
 * See: https://en.wikipedia.org/wiki/Verlet_integration#Velocity_Verlet
 * @param bodies Array of CelestialBody objects (their position, velocity, acceleration will be updated).
 * @param dt The simulation time step (in simulation units, e.g., years).
 */

export function updateBodies(bodies: CelestialBody[], dt: number): void {
    const oldAccelerations = new Map<CelestialBody, THREE.Vector3>();
    bodies.forEach(body => {
        oldAccelerations.set(body, body.acceleration.clone()); // Store old acceleration
    });

    // --- Step 1: Update positions using current velocity and OLD acceleration ---
    // Equation: p_{n+1} = p_n + v_n*dt + 0.5*a_n*dt^2
    bodies.forEach(body => {
        const v_old = body.velocity;
        const a_old = oldAccelerations.get(body)!;

        // Calculate new position p_{n+1} and update body.position
        body.position.addScaledVector(v_old, dt)
                     .addScaledVector(a_old, 0.5 * dt * dt);
    });

    // --- Step 2: Calculate forces and NEW accelerations based on NEW positions ---
    // Calculate F_{n+1} using the updated positions p_{n+1}
    const newForces = calculateAllForces(bodies);
    const newAccelerations: Map<CelestialBody, THREE.Vector3> = new Map();
    bodies.forEach(body => {
        const totalForce = newForces.get(body)!;
        if (body.mass === 0) {
            newAccelerations.set(body, new THREE.Vector3(0, 0, 0)); // No acceleration for massless bodies
        } else {
            const acceleration_new = new THREE.Vector3().copy(totalForce).divideScalar(body.mass);
            newAccelerations.set(body, acceleration_new); 
        }
    });

    // --- Step 3: Update velocities using the AVERAGE of old and new accelerations ---
    // Equation: v_{n+1} = v_n + 0.5 * (a_n + a_{n+1}) * dt
    bodies.forEach(body => {
        const a_old = oldAccelerations.get(body)!;
        const a_new = newAccelerations.get(body)!;

        const avg_acceleration = new THREE.Vector3().addVectors(a_old, a_new).multiplyScalar(0.5);

        body.velocity.addScaledVector(avg_acceleration, dt);

    });

    // --- Step 4: Store the NEW accelerations for the next time step ---
    // The a_{n+1} calculated in Step 2 becomes the a_n for the *next* iteration's Step 1 & 3.
    bodies.forEach(body => {
        body.acceleration.copy(newAccelerations.get(body)!); // Update the acceleration for the next iteration
    });
}
