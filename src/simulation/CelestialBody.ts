import * as THREE from 'three';

export class CelestialBody {
    name: string;
    mass: number;
    position: THREE.Vector3; // current position in 3d space
    velocity: THREE.Vector3; // current velocity in 3d space
    acceleration: THREE.Vector3; // current acceleration in 3d space
    mesh: THREE.Mesh;
    pathPoints: THREE.Vector3[]; // Array to store path points for rendering
    rotationFactor: number; // Factor to scale visual rotation speed for planets

    constructor(
        name: string,
        mass: number,
        position: THREE.Vector3,
        velocity: THREE.Vector3,
        mesh: THREE.Mesh,
        rotationFactor: number = 0
    ) {
        this.name = name;
        this.mass = mass;
        this.position = position;
        this.velocity = velocity;
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.mesh = mesh;
        this.pathPoints = []; 
        this.rotationFactor = rotationFactor;
    }
}