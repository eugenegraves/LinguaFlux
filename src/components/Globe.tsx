import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const Globe = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create the globe geometry
    const geometry = new THREE.SphereGeometry(2, 64, 64);

    // Texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Create a texture for the globe - would be replaced with actual texture
    const texture = new THREE.CanvasTexture(createGlobeTexture());
    
    // Material with semi-transparency
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8,
      shininess: 50,
      emissive: 0x333333,
      emissiveIntensity: 0.5,
    });

    // Create the globe mesh
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add point light
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Add controls for development/testing
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate the globe
      globe.rotation.y += 0.001;
      
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Function to create a canvas with textures
  function createGlobeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Fill background
      context.fillStyle = '#D4A5A5';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw a grid of simple cultural patterns
      const patternSize = 64;
      const patterns = [
        drawKentePattern,
        drawPaisleyPattern,
        drawSeigaihaPattern,
        drawMoroccanPattern
      ];
      
      for (let y = 0; y < canvas.height; y += patternSize) {
        for (let x = 0; x < canvas.width; x += patternSize) {
          const patternFunc = patterns[Math.floor(Math.random() * patterns.length)];
          patternFunc(context, x, y, patternSize);
        }
      }
    }
    
    return canvas;
  }

  // Simple pattern drawing functions
  function drawKentePattern(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.fillStyle = '#E7B355';
    ctx.fillRect(x, y, size, size);
    
    ctx.fillStyle = '#8C4B2E';
    ctx.fillRect(x + size / 4, y + size / 4, size / 2, size / 2);
    
    ctx.fillStyle = '#2E4B8C';
    ctx.fillRect(x + size * 3/8, y + size * 3/8, size / 4, size / 4);
  }
  
  function drawPaisleyPattern(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.fillStyle = '#DEC4AF';
    ctx.fillRect(x, y, size, size);
    
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y + size / 4);
    ctx.bezierCurveTo(
      x + size * 3/4, y + size / 3,
      x + size * 3/4, y + size * 2/3,
      x + size / 2, y + size * 3/4
    );
    ctx.bezierCurveTo(
      x + size / 4, y + size * 2/3,
      x + size / 4, y + size / 3,
      x + size / 2, y + size / 4
    );
    ctx.fillStyle = '#9F5F3B';
    ctx.fill();
  }
  
  function drawSeigaihaPattern(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.fillStyle = '#CADEEF';
    ctx.fillRect(x, y, size, size);
    
    const radius = size / 4;
    
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#4A789C';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, radius * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = '#CADEEF';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#4A789C';
    ctx.fill();
  }
  
  function drawMoroccanPattern(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.fillStyle = '#F7D599';
    ctx.fillRect(x, y, size, size);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size / 2, y + size / 2);
    ctx.lineTo(x, y + size);
    ctx.fillStyle = '#CC7E4B';
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + size, y);
    ctx.lineTo(x + size / 2, y + size / 2);
    ctx.lineTo(x + size, y + size);
    ctx.fillStyle = '#CC7E4B';
    ctx.fill();
  }

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} />;
};

export default Globe; 