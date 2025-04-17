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
        const sun = new CelestialBody('Sun', config.SUN_MASS, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), sunMesh, 0, 0);
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
                shininess: 0
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
                p.rotationFactor,
                p.maxTrailPoints
            );
            planetMesh.position.copy(initialPosition).multiplyScalar(this.distanceScale);
            this.scene.add(planetBody.mesh);
            this.bodies.push(planetBody);

            // Create orbit line
            const orbitGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(p.maxTrailPoints * 3);
            const positionAttribute = new THREE.BufferAttribute(positions, 3);
            orbitGeometry.setAttribute('position', positionAttribute);
            const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xAAAAAA, transparent: true, opacity: 0.6 });
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
            this.scene.add(orbitLine);
            this.orbitLines.set(planetBody, orbitLine);

              // --- Rings of Saturn ---
              if (p.name === 'Saturn') {
                console.log("Creating rings for Saturn...");

                // Define ring geometry parameters relative to Saturn's visual radius (p.visualRadius = 0.16)
                const innerRadius = p.visualRadius * 1.2; // distance from saturn center to edge
                const outerRadius = p.visualRadius * 2.0; // 
                const radialSegments = 1; 
                const thetaSegments = 128; // Increase for smoother ring

                // Calculate dimensions for the equivalent flat plane
                const averageRadius = (innerRadius + outerRadius) / 2;
                const ringCircumference = 2 * Math.PI * averageRadius;
                const ringRadialWidth = outerRadius - innerRadius;

                // Create the PlaneGeometry
                const ringPlaneGeometry = new THREE.PlaneGeometry(
                    ringCircumference,  // Width = Circumference
                    ringRadialWidth,    // Height = Radial Width
                    thetaSegments,      // Width Segments
                    radialSegments      // Height Segments
                );

                // --- Manipulate Vertices to form a ring ---
                const posAttribute = ringPlaneGeometry.attributes.position;
                const normalAttribute = ringPlaneGeometry.attributes.normal; // Keep normals pointing up

                for (let i = 0; i < posAttribute.count; i++) {
                    const x = posAttribute.getX(i); // Position along circumference in flat plane
                    const y = posAttribute.getY(i); // Position along radius in flat plane

                    // Calculate radius based on original Y position
                    // Plane Y goes from -height/2 to +height/2
                    const radius = innerRadius + ((y + ringRadialWidth / 2) / ringRadialWidth) * ringRadialWidth;

                    // Calculate angle (theta) based on original X position
                    // Plane X goes from -width/2 to +width/2
                    const theta = ((x + ringCircumference / 2) / ringCircumference) * 2 * Math.PI;

                    // Calculate new 3D coordinates
                    const newX = radius * Math.cos(theta);
                    const newY = 0; // Keep it flat on the mesh's local XY plane initially
                    const newZ = radius * Math.sin(theta); // Use Z for the other dimension

                    // Set the new vertex position
                    posAttribute.setXYZ(i, newX, newY, newZ);

                    // Normals should generally point "up" (local Y) for a flat ring
                    normalAttribute.setXYZ(i, 0, 1, 0);

                }
                posAttribute.needsUpdate = true; // Update the position attribute
                normalAttribute.needsUpdate = true; // Update the normal attribute
                ringPlaneGeometry.computeBoundingSphere(); // Recalculate bounds

                // Load textures
                const ringColorTexture = textureLoader.load('textures/saturnringcolor.jpg');
                const ringPatternTexture = textureLoader.load('textures/saturnringpattern.png'); 
                ringColorTexture.colorSpace = THREE.SRGBColorSpace;

                // Set texture wrapping and repeating
                [ringColorTexture, ringPatternTexture].forEach(texture => {
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;
                    texture.rotation = Math.PI / 2; // No rotation needed for rings
                    texture.center.set(0.5, 0.5); 
                    texture.repeat.set(1, 2); // Adjust repeat values as needed
                });

                // Create ring material
                const ringMaterial = new THREE.MeshPhongMaterial({
                    map: ringColorTexture,
                    alphaMap: ringPatternTexture,
                    transparent: true,
                    side: THREE.DoubleSide,
                });

                // Create ring mesh
                const ringMesh = new THREE.Mesh(ringPlaneGeometry, ringMaterial);
                planetMesh.add(ringMesh);
            }

            // --- Kinematic Moons ---
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
                    const moonPositions = new Float32Array(m.maxTrailPoints * 3);
                    const moonPositionAttribute = new THREE.BufferAttribute(moonPositions, 3);
                    moonOrbitGeometry.setAttribute('position', moonPositionAttribute);
                    const moonOrbitMaterial = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.3 }); // Moon trail color
                    const moonOrbitLine = new THREE.Line(moonOrbitGeometry, moonOrbitMaterial);
                    this.scene.add(moonOrbitLine);

                    planetBody.childMoons.push({
                        name: m.name,
                        mass: m.mass,
                        mesh: moonMesh,
                        orbitRadius: m.orbitRadius,
                        orbitSpeed: m.orbitSpeed,
                        currentOrbitAngle: initialAngle,
                        rotationFactor: m.rotationFactor,
                        pathPoints: [], // Initialize empty path points array
                        orbitLine: moonOrbitLine, // Store the line object
                        maxTrailPoints: m.maxTrailPoints // Max points in orbit trails
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

                if (body.pathPoints.length > body.maxTrailPoints) {
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

            // Update kinematic moons
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
                    if (moon.pathPoints.length > moon.maxTrailPoints) {
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