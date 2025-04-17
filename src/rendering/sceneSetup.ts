import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface SceneElements {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    ambientLight: THREE.AmbientLight;
    pointLight: THREE.PointLight;
    controls: OrbitControls;
}

export function setupSceneGraph(): SceneElements {
    // --- Scene Setup ---
    const scene = new THREE.Scene();

    // --- Texture Loader for Background ---
    const textureLoader = new THREE.TextureLoader();

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );

    // --- Skysphere Background ---
    const starTexture = textureLoader.load('textures/8k_stars.jpg');

    // --- Explicitly Set Filtering & Encoding ---
    starTexture.minFilter = THREE.LinearMipmapLinearFilter; 
    starTexture.magFilter = THREE.LinearFilter; 
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    starTexture.anisotropy = maxAnisotropy; 
    starTexture.colorSpace = THREE.SRGBColorSpace; 

    const skyGeometry = new THREE.SphereGeometry(3000, 64, 64); // Radius, Width Segments, Height Segments
    const skyMaterial = new THREE.MeshBasicMaterial({
        map: starTexture,
        side: THREE.BackSide
    });

    // Create the skysphere mesh
    const skysphere = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skysphere); // Add skysphere to the scene

    // --- Camera Setup ---
    const camera = new THREE.PerspectiveCamera(
        75, // fov
        window.innerWidth / window.innerHeight, // aspect
        0.1, // near clipping plane
        10000 // far clipping plane 
    );
    camera.position.set( 0, 5, 10); // Initial camera position 

    // --- Lighting Setup ---
    const ambientLight = new THREE.AmbientLight( 0x606060, 1 ); // Use a slightly brighter ambient light
    scene.add( ambientLight );

    const pointLight = new THREE.PointLight( 0xffffff, 10, 0, 0.5 ); // Realistic decay
    pointLight.castShadow = true; // Enable shadows for the point light
    scene.add( pointLight );

    // --- Controls Setup ---
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 5000;

    // --- Handle Window Resize ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
    };
    window.addEventListener( 'resize', handleResize);
    // maybe return a 'dispose' function later to remove the listener if needed

    return { scene, camera, renderer, ambientLight, pointLight, controls };
}