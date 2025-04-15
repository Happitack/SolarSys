import * as THREE from 'three';
import { CelestialBody, KinematicMoon } from './CelestialBody';
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
        const worldAxisX = new THREE.Vector3(1, 0, 0);

        // --- Sun ---
        const sunGeometry = new THREE.SphereGeometry(config.SUN_VISUAL_RADIUS, 32, 16);
        const sunTexture = textureLoader.load(config.SUN_TEXTURE_FILE);
        sunTexture.colorSpace = THREE.SRGBColorSpace; 
        const sunMaterial = new THREE.MeshPhongMaterial({ map: sunTexture, emissiveMap: sunTexture, emissiveIntensity: 1, emissive: 0xffffff, lightMap: sunTexture, lightMapIntensity: 2 });
        const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        sunMesh.rotateOnWorldAxis(worldAxisX, THREE.MathUtils.degToRad(7.25));
        const sun = new CelestialBody('Sun', config.SUN_MASS, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), sunMesh, 0);
        sunMesh.position.copy(sun.position);
        this.scene.add(sunMesh);
        this.bodies.push(sun);
        this.pointLight.position.copy(sun.position); // Position the light

        // --- Planets ---
        config.PLANETS_DATA.forEach(p => {
            const physics_a = p.a
            const physics_v = Math.sqrt(G * config.SUN_MASS / physics_a);
            const initialPosition = new THREE.Vector3(physics_a, 0, 0);
            //const initialVelocity = new THREE.Vector3(0, 0, physics_v);
            
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
            planetMesh.rotateOnWorldAxis(worldAxisX, THREE.MathUtils.degToRad(p.axialTilt));

            // Create body using the new mesh
            const planetBody = new CelestialBody(p.name, 
                p.mass, 
                new THREE.Vector3(physics_a, 0, 0), 
                new THREE.Vector3(0, 0, physics_v), 
                planetMesh,
                p.rotationFactor);

            planetMesh.position.copy(initialPosition).multiplyScalar(this.distanceScale);
            this.scene.add(planetBody.mesh);
            this.bodies.push(planetBody);

            // Create orbit line
            const orbitGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(config.MAX_TRAIL_POINTS * 3);
            const positionAttribute = new THREE.BufferAttribute(positions, 3);
            orbitGeometry.setAttribute('position', positionAttribute);
            const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xAAAAAA, transparent: true, opacity: 0.6 });
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
            this.scene.add(orbitLine);
            this.orbitLines.set(planetBody, orbitLine);

            // --- Moons ---
            if (p.moons && p.moons.length > 0) {
                p.moons.forEach(m => {
                    const moonTexture = textureLoader.load(m.textureFile);
                    moonTexture.colorSpace = THREE.SRGBColorSpace;
                    const moonGeometry = new THREE.SphereGeometry(m.visualRadius, 16, 8);
                    const moonMaterial = new THREE.MeshPhongMaterial({ map: moonTexture, shininess: 20 });
                    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
                    moonMesh.name = m.name;
                    moonMesh.rotateOnWorldAxis(worldAxisX, THREE.MathUtils.degToRad(m.axialTilt)); // Apply moon tilt
                    
                    const initialAngle = Math.random() * Math.PI * 2;
                    const initialLocalX = m.orbitRadius * Math.cos(initialAngle);
                    const initialLocalZ = m.orbitRadius * Math.sin(initialAngle);

                    moonMesh.position.set(
                        planetMesh.position.x + initialLocalX,
                        planetMesh.position.y,
                        planetMesh.position.z + initialLocalZ
                    );

                    this.scene.add(moonMesh);

                    const moonOrbitGeometry = new THREE.BufferGeometry();
                    const moonPositions = new Float32Array(config.MAX_TRAIL_POINTS * 3);
                    const moonPositionAttribute = new THREE.BufferAttribute(moonPositions, 3);
                    moonOrbitGeometry.setAttribute('position', moonPositionAttribute);
                    const moonOrbitMaterial = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.3 }); // Moon trail color
                    const moonOrbitLine = new THREE.Line(moonOrbitGeometry, moonOrbitMaterial);
                    this.scene.add(moonOrbitLine);

                    planetBody.childMoons.push({
                        mesh: moonMesh,
                        orbitRadius: m.orbitRadius,
                        orbitSpeed: m.orbitSpeed,
                        currentOrbitAngle: initialAngle,
                        rotationFactor: m.rotationFactor,
                        pathPoints: [], // Initialize empty path points array
                        orbitLine: moonOrbitLine // Store the line object
                    });

                });
            }
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

            // Update moons
            if (body.childMoons && body.childMoons.length > 0) {
                body.childMoons.forEach((moon: KinematicMoon) => {
                    moon.currentOrbitAngle += moon.orbitSpeed * effectiveDt;

                    // Calculate new kinematic position
                    const localX = moon.orbitRadius * Math.cos(moon.currentOrbitAngle);
                    const localZ = moon.orbitRadius * Math.sin(moon.currentOrbitAngle);
                    moon.mesh.position.set(
                        body.mesh.position.x + localX,
                        body.mesh.position.y,
                        body.mesh.position.z + localZ
                    );

                    // Apply moon's daily rotation
                    const moonAngleIncrement = moon.rotationFactor * config.VISUAL_ROTATION_SCALE_FACTOR * effectiveDt;
                    moon.mesh.rotation.y += moonAngleIncrement;

                    // --- Update Moon Orbit Trail ---
                    moon.pathPoints.push(moon.mesh.position.clone()); // Add current world position
                    if (moon.pathPoints.length > config.MAX_TRAIL_POINTS) {
                        moon.pathPoints.shift(); // Limit length
                    }

                    // Update the line geometry (check > 1 needed)
                    if (moon.orbitLine && moon.pathPoints.length > 1) {
                        const geometry = moon.orbitLine.geometry;
                        const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;
                        for (let i = 0; i < moon.pathPoints.length; i++) {
                            const point = moon.pathPoints[i];
                            positionAttribute.array[i * 3 + 0] = point.x;
                            positionAttribute.array[i * 3 + 1] = point.y;
                            positionAttribute.array[i * 3 + 2] = point.z;
                        }
                        geometry.setDrawRange(0, moon.pathPoints.length);
                        positionAttribute.needsUpdate = true;
                        geometry.computeBoundingSphere();
                    }

                });
            }
        });
    }

    public setTrailsVisible(visible: boolean): void {
        this.orbitLines.forEach((line) => {
            line.visible = visible;
        });
        this.bodies.forEach(body => { 
            if (body.childMoons && body.childMoons.length > 0) {
                body.childMoons.forEach(moon => {
                    if (moon.orbitLine) {
                       moon.orbitLine.visible = visible;
                    }
                });
            }
        });

    }
}