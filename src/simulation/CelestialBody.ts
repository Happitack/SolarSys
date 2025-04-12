import * as THREE from 'three';

export class CelestialBody {
    name: string;
    mass: number;
    position: THREE.Vector3; // current position in 3d space
    velocity: THREE.Vector3; // current velocity in 3d space
    acceleration: THREE.Vector3; // current acceleration in 3d space
    mesh: THREE.Mesh;
    pathPoints: THREE.Vector3[]; // Array to store path points for rendering

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
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.mesh = mesh;
        this.pathPoints = []; 
        this.mesh.position.copy(this.position); // Set initial position of the mesh
    }
}