import * as THREE from 'three';
import { CelestialBody } from './CelestialBody'; 
import * as config from '../config'; 
import { G } from './Physics'; 

export class SolarSystem {
    public bodies: CelestialBody[] = []; 
    private orbitLines = new Map<CelestialBody, THREE.Line>();
    private scene: THREE.Scene;
    private pointLight: THREE.PointLight;

    constructor(scene: THREE.Scene, pointLight: THREE.PointLight) {
        this.scene = scene;
        this.pointLight = pointLight;
        this._createSolarSystemObjects();
    }

    // Creates all the objects and adds them to the scene/internal lists
    private _createSolarSystemObjects(): void {
        const textureLoader = new THREE.TextureLoader();

        // --- Sun ---
        const sunGeometry = new THREE.SphereGeometry(config.SUN_VISUAL_RADIUS, 32, 16);
        const sunTexture = textureLoader.load(config.SUN_TEXTURE_FILE);
        const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
        const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        const sun = new CelestialBody('Sun', config.SUN_MASS, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), sunMesh, 0);
        this.scene.add(sunMesh);
        this.bodies.push(sun);
        this.pointLight.position.copy(sun.position); // Position the light

        // --- Planets ---
        config.PLANETS_DATA.forEach(p => {
            const scaled_a = p.a * config.DISTANCE_SCALE;
            const recalculated_v = Math.sqrt(G * config.SUN_MASS / scaled_a);
            const planetTexture = textureLoader.load(p.textureFile);

            // --- Modify Planet Material Creation ---
            const planetGeometry = new THREE.SphereGeometry(p.visualRadius, 32, 16);
            const planetMaterial = new THREE.MeshPhongMaterial({
                map: planetTexture,
                shininess: 100
            });
            const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
            planetMesh.name = p.name;
            // Apply axialt tilt rotation
            planetMesh.rotation.z = THREE.MathUtils.degToRad(p.axialTilt);

            // Create body using the new mesh
            const planetBody = new CelestialBody(p.name, 
                p.mass, 
                new THREE.Vector3(scaled_a, 0, 0), 
                new THREE.Vector3(0, recalculated_v, 0), 
                planetMesh,
                p.rotationFactor);

            this.scene.add(planetBody.mesh);
            this.bodies.push(planetBody);

            // Create orbit line
            const orbitGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(config.MAX_TRAIL_POINTS * 3);
            const positionAttribute = new THREE.BufferAttribute(positions, 3);
            orbitGeometry.setAttribute('position', positionAttribute);
            const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xAAAAAA, transparent: true, opacity: 0.1 });
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
            this.scene.add(orbitLine); // Add line to the scene
            this.orbitLines.set(planetBody, orbitLine); // Store line internally
        });
    }

    // Method to update the visual aspects (meshes, trails) based on body data
    public updateVisuals(): void {
        this.bodies.forEach(body => {
            // Update mesh position from body's physics state
            body.mesh.position.copy(body.position);

            if (body.name === 'Sun') {
                // Ensure point light follows the Sun if it ever moves
                this.pointLight.position.copy(body.position);
            } else {
                // Update rotation for planets
                const angleIncrement = body.rotationFactor * config.VISUAL_ROTATION_SCALE_FACTOR * config.DT;
                body.mesh.rotation.y += angleIncrement; // Rotate around local Y axis

                // Update Orbit Trail
                body.pathPoints.push(body.position.clone());
                if (body.pathPoints.length > config.MAX_TRAIL_POINTS) {
                    body.pathPoints.shift();
                }

                const line = this.orbitLines.get(body);
                if (line && body.pathPoints.length > 1) {
                    const geometry = line.geometry;
                    const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;
                    for (let i = 0; i < body.pathPoints.length; i++) {
                        const point = body.pathPoints[i];
                        positionAttribute.array[i * 3 + 0] = point.x;
                        positionAttribute.array[i * 3 + 1] = point.y;
                        positionAttribute.array[i * 3 + 2] = point.z;
                    }
                    geometry.setDrawRange(0, body.pathPoints.length);
                    positionAttribute.needsUpdate = true;
                    geometry.computeBoundingSphere(); // Important for visibility
                }
            }
        });
    }
}