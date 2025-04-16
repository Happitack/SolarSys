import * as THREE from 'three';

export interface KinematicMoon {
    mesh: THREE.Mesh;
    orbitRadius: number; // in AU
    orbitSpeed: number; // in AU/year
    currentOrbitAngle: number; // in radians
    rotationFactor: number; // spin speed factor
    pathPoints: THREE.Vector3[]; // Array to store path points for rendering
    orbitLine: THREE.Line;
    maxTrailPoints: number; // Max points in orbit trails 
}

export class CelestialBody {
    name: string;
    mass: number;
    position: THREE.Vector3; // current position in 3d space
    velocity: THREE.Vector3; // current velocity in 3d space
    acceleration: THREE.Vector3; // current acceleration in 3d space
    mesh: THREE.Mesh;
    pathPoints: THREE.Vector3[]; // Array to store path points for rendering
    rotationFactor: number; // Factor to scale visual rotation speed for planets
    maxTrailPoints: number;
    public childMoons: KinematicMoon[] = [];
    public dwarf: boolean = false; // Optional property to indicate if it's a dwarf planet

    constructor(
        name: string,
        mass: number,
        position: THREE.Vector3,
        velocity: THREE.Vector3,
        mesh: THREE.Mesh,
        rotationFactor: number = 0,
        maxTrailPoints: number = 1000 // Default value for maxTrailPoints
    ) {
        this.name = name;
        this.mass = mass;
        this.position = position;
        this.velocity = velocity;
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.mesh = mesh;
        this.pathPoints = []; 
        this.rotationFactor = rotationFactor;
        this.maxTrailPoints = maxTrailPoints;
        this.childMoons = [];
        this.dwarf = false; // Default value for dwarf property
    }
}