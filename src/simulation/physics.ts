import * as THREE from 'three';
import { CelestialBody } from './CelestialBody';

// --- Constants ---
export const G = 1; // Gravitational constant for the simulation
const EPSILON = 1e-6; // Small value to prevent division by zero

// --- Functions ---
/**
 * Calculates the gravitational force between two celestial bodies.
 * @param body1 - The first celestial body.
 * @param body2 - The second celestial body.
 * @returns The gravitational force vector acting on body1 due to body2.
 */

function calculateGravitationalForce(body1: CelestialBody, body2: CelestialBody): THREE.Vector3 {
    const distanceVector = new THREE.Vector3().subVectors(body2.position, body1.position);
    const distanceSquared = distanceVector.lengthSq();

    if (distanceSquared < EPSILON) {
        return new THREE.Vector3(0, 0, 0); // Prevent division by zero
    }

    const distance = Math.sqrt(distanceSquared)
    const forceMagnitude = (G * body1.mass * body2.mass) / distanceSquared;
    const forceVector = distanceVector.normalize().multiplyScalar(forceMagnitude);
    return forceVector;
}

/**
 * Calculates the total force on each body basedon their current positions.
 * @param bodies Array of CelestialBody objects
 * @returns Map<CelestialBody, THREE.Vector3> - A map of celestial bodies to their respective forces
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
 * Updates the position and velocity of all celestial bodies using Velocity Verlet integration.
 * @param bodies Array of CelestialBody objects.
 * @param dt Time step (in simulation units).
 */

export function updateBodies(bodies: CelestialBody[], dt: number): void {
    const oldAccelerations = new Map<CelestialBody, THREE.Vector3>();
    bodies.forEach(body => {
        oldAccelerations.set(body, body.acceleration.clone()); // Store old acceleration
    });

    // --- Step 1: Update positions ---
    // p_new = p_old + v_old * dt + 0.5 * a_old * dt^2
    bodies.forEach(body => {
        const v_old = body.velocity;
        const a_old = oldAccelerations.get(body)!;

        body.position.addScaledVector(v_old, dt)
                     .addScaledVector(a_old, 0.5 * dt * dt);
    });

    // --- Step 2: Calculate forces and update accelerations ---
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

    // --- Step 3: Update velocities ---
    // v_new = v_old + 0.5 * (a_old + a_new) * dt
    bodies.forEach(body => {
        const a_old = oldAccelerations.get(body)!;
        const a_new = newAccelerations.get(body)!;

        const avg_acceleration = new THREE.Vector3().addVectors(a_old, a_new).multiplyScalar(0.5);

        body.velocity.addScaledVector(avg_acceleration, dt);

    });

    // --- Step 4: Store the new accelerations ---
    bodies.forEach(body => {
        body.acceleration.copy(newAccelerations.get(body)!); // Update the acceleration for the next iteration
    });
}