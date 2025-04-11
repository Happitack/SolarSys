import * as THREE from 'three';
import { CelestialBody } from './CelestialBody';

// --- Constants ---
export const G = 1; // Gravitational constant for the simulation
const EPSILON = 1e-6; // Small value to prevent division by zero

// --- Functions ---
/**
 * Calculates the gravitational force vector exerted by body2 on body1.
 * F = G * (m1 * m2) / r^2
 * The force vector points from body1 towards body2.
 * @param body1 The body experiencing the force.
 * @param body2 The body exerting the force.
 * @returns THREE.Vector3 The force vector acting on body1.
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

export function updateBodies(bodies: CelestialBody[], dt: number): void {
    // Calculate total force on each body
    const forces: Map<CelestialBody, THREE.Vector3> = new Map();

    // Initialize forces for bodies
    bodies.forEach(body => {
        forces.set(body, new THREE.Vector3(0, 0, 0));
    });

    // Calculate pairwise forces (N-body calculation)
    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            const body1 = bodies[i];
            const body2 = bodies[j];

            const force = calculateGravitationalForce(body1, body2);

            // Add force to object 1
            forces.get(body1)?.add(force);
            // Add equal and opposite force to object 2
            forces.get(body2)?.sub(force);
        }
    }

    bodies.forEach(body => {
        const totalForce = forces.get(body);
        if (!totalForce) return; // Skip if force is undefined

        // Calculate acceleration
        if (body.mass === 0) return; // Prevent division by zero
        const acceleration = new THREE.Vector3().copy(totalForce).divideScalar(body.mass);

        // Update velocity
        body.velocity.addScaledVector(acceleration, dt);

        // Update position
        body.position.addScaledVector(body.velocity, dt);
    });
}