'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!cursorRef.current) return;

    // Initialize Three.js scene
    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    rendererRef.current = new THREE.WebGLRenderer({ alpha: true });

    rendererRef.current.setSize(80, 80);
    cursorRef.current.appendChild(rendererRef.current.domElement);

    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x64ffda,
      transparent: true,
      opacity: 0.8,
      wireframe: true,
    });

    sphereRef.current = new THREE.Mesh(geometry, material);
    sceneRef.current.add(sphereRef.current);

    // Add lights
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    sceneRef.current.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    sceneRef.current.add(ambientLight);

    cameraRef.current.position.z = 5;

    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);

      if (sphereRef.current) {
        sphereRef.current.rotation.x += 0.01;
        sphereRef.current.rotation.y += 0.01;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Mouse move handler
    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px';
        cursorRef.current.style.top = e.clientY + 'px';
      }
    };

    document.addEventListener('mousemove', onMouseMove);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      if (cursorRef.current && rendererRef.current) {
        cursorRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  return (
    <motion.div
      ref={cursorRef}
      className="cursor-container"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      style={{
        position: 'fixed',
        width: '80px',
        height: '80px',
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}