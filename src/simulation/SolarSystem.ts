import * as THREE from 'three';
import { CelestialBody } from './CelestialBody'; 
import * as config from '../config'; 
import { G } from './Physics'; 

export class SolarSystem {
    public bodies: CelestialBody[] = []; 
    private orbitLines = new Map<CelestialBody, THREE.Line>();
    private scene: THREE.Scene;
    private pointLight: THREE.PointLight;
    private distanceScale: number;

    constructor(scene: THREE.Scene, pointLight: THREE.PointLight) {
        this.scene = scene;
        this.pointLight = pointLight;
        this.distanceScale = config.DISTANCE_SCALE;
        this._createSolarSystemObjects();
    }

    // Creates all the objects and adds them to the scene/internal lists
    private _createSolarSystemObjects(): void {
        const textureLoader = new THREE.TextureLoader();

        // --- Sun ---
        const sunGeometry = new THREE.SphereGeometry(config.SUN_VISUAL_RADIUS, 32, 16);
        const sunTexture = textureLoader.load(config.SUN_TEXTURE_FILE);
        sunTexture.colorSpace = THREE.SRGBColorSpace; 
        const sunMaterial = new THREE.MeshPhongMaterial({ map: sunTexture, emissiveMap: sunTexture, emissiveIntensity: 1, emissive: 0xffffff, lightMap: sunTexture, lightMapIntensity: 2 });
        const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        sunMesh.rotation.x = THREE.MathUtils.degToRad(90); // Apply hacky rotation
        const sun = new CelestialBody('Sun', config.SUN_MASS, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), sunMesh, 0);
        sunMesh.position.copy(sun.position);
        this.scene.add(sunMesh);
        this.bodies.push(sun);
        this.pointLight.position.copy(sun.position); // Position the light

        // --- Planets ---
        config.PLANETS_DATA.forEach(p => {
            const physics_a = p.a
            const physics_v = Math.sqrt(G * config.SUN_MASS / physics_a);
            
            // --- Planet Material Creation ---
            const planetTexture = textureLoader.load(p.textureFile);
            planetTexture.colorSpace = THREE.SRGBColorSpace;
            const planetGeometry = new THREE.SphereGeometry(p.visualRadius, 32, 16);
            const planetMaterial = new THREE.MeshPhongMaterial({
                map: planetTexture,
                shininess: 100
            });
            const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
            planetMesh.name = p.name;
            planetMesh.rotation.z = THREE.MathUtils.degToRad(p.axialTilt);

            // Create body using the new mesh
            const planetBody = new CelestialBody(p.name, 
                p.mass, 
                new THREE.Vector3(physics_a, 0, 0), 
                new THREE.Vector3(0, physics_v, 0), 
                planetMesh,
                p.rotationFactor);

            planetMesh.position.set(physics_a * this.distanceScale, 0, 0);

            this.scene.add(planetBody.mesh);
            this.bodies.push(planetBody);

            // Create orbit line
            const orbitGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(config.MAX_TRAIL_POINTS * 3);
            const positionAttribute = new THREE.BufferAttribute(positions, 3);
            orbitGeometry.setAttribute('position', positionAttribute);
            const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xAAAAAA, transparent: true, opacity: 0.6 });
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
            this.scene.add(orbitLine); // Add line to the scene
            this.orbitLines.set(planetBody, orbitLine); // Store line internally
        });
    }

    // Method to update the visual aspects (meshes, trails) based on body data
    public updateVisuals(effectiveDt: number): void {
        this.bodies.forEach(body => {
            if (body.name === 'Sun') {
                // Sun stays in place
                body.mesh.position.copy(body.position); 
                this.pointLight.position.copy(body.position);
            } else {
                body.mesh.position.copy(body.position).multiplyScalar(this.distanceScale);
                const scaledPosition = body.mesh.position.clone();
                body.pathPoints.push(scaledPosition);

                if (body.pathPoints.length > config.MAX_TRAIL_POINTS) {
                    body.pathPoints.shift(); 
                }

                const angleIncrement = body.rotationFactor * config.VISUAL_ROTATION_SCALE_FACTOR * effectiveDt;
                body.mesh.rotation.y += angleIncrement; // Rotate around local Y axis


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

    public setTrailsVisible(visible: boolean): void {
        this.orbitLines.forEach((line) => {
            line.visible = visible;
        });
    }
}