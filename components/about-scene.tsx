"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function AboutScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.z = 4;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0x6366f1, 1);
    dirLight.position.set(3, 3, 3);
    scene.add(dirLight);

    const geometry = new THREE.IcosahedronGeometry(1.2, 3);
    const wireMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.1,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, wireMaterial);
    scene.add(mesh);

    const innerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const innerMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.06,
    });
    const inner = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(inner);

    const positionAttr = geometry.attributes.position as THREE.BufferAttribute;
    const originalPositions = new Float32Array(positionAttr.array);

    let rafId = 0;
    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;
      mesh.rotation.x = t * 0.12;
      mesh.rotation.y = t * 0.18;
      inner.rotation.y = -t * 0.08;
      const pos = positionAttr.array as Float32Array;
      for (let i = 0; i < pos.length; i += 3) {
        const ox = originalPositions[i];
        const oy = originalPositions[i + 1];
        const oz = originalPositions[i + 2];
        const n = Math.sin(ox * 2 + t) * Math.cos(oy * 2 + t * 0.7) * 0.07;
        pos[i] = ox + ox * n;
        pos[i + 1] = oy + oy * n;
        pos[i + 2] = oz + oz * n;
      }
      positionAttr.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      geometry.dispose();
      innerGeometry.dispose();
      wireMaterial.dispose();
      innerMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
