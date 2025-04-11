import * as THREE from 'three';

export class CelestialBody {
    name: string;
    mass: number;
    position: THREE.Vector3; // current position in 3d space
    velocity: THREE.Vector3; // current velocity in 3d space
    mesh: THREE.Mesh;

    constructor(
        name: string,
        mass: number,
        position: THREE.Vector3,
        velocity: THREE.Vector3,
        mesh: THREE.Mesh
    ) {
        this.name = name;
        this.mass = mass;
        this.position = position;
        this.velocity = velocity;
        this.mesh = mesh;

        this.mesh.position.copy(this.position); // Set initial position of the mesh
    }
}