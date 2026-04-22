"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ShapeUserData {
  rotX: number;
  rotY: number;
  offset: number;
}

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.z = 6;

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0x6366f1, 0.7);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x8b5cf6, 0.5, 20);
    pointLight.position.set(-3, 2, 4);
    scene.add(pointLight);

    const geometries: THREE.BufferGeometry[] = [
      new THREE.IcosahedronGeometry(0.5, 0),
      new THREE.OctahedronGeometry(0.45, 0),
      new THREE.TetrahedronGeometry(0.4, 0),
      new THREE.TorusGeometry(0.35, 0.12, 16, 32),
      new THREE.DodecahedronGeometry(0.4, 0),
    ];
    const colors = [0x6366f1, 0x8b5cf6, 0xa78bfa, 0xc4b5fd, 0x818cf8];

    interface Shape {
      mesh: THREE.Mesh;
      data: ShapeUserData;
    }

    const shapes: Shape[] = [];
    const materials: THREE.Material[] = [];

    for (let i = 0; i < 10; i++) {
      const material = new THREE.MeshPhysicalMaterial({
        color: colors[i % colors.length],
        transparent: true,
        opacity: 0.1 + Math.random() * 0.12,
        roughness: 0.2,
        wireframe: i % 3 === 0,
      });
      materials.push(material);
      const mesh = new THREE.Mesh(geometries[i % geometries.length], material);
      mesh.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4 - 1,
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        0,
      );
      const data: ShapeUserData = {
        rotX: (Math.random() - 0.5) * 0.006,
        rotY: (Math.random() - 0.5) * 0.006,
        offset: Math.random() * Math.PI * 2,
      };
      scene.add(mesh);
      shapes.push({ mesh, data });
    }

    let mouseX = 0;
    let mouseY = 0;
    function onMouseMove(e: MouseEvent) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    let rafId = 0;
    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;
      if (!prefersReducedMotion) {
        shapes.forEach(({ mesh, data }) => {
          mesh.rotation.x += data.rotX;
          mesh.rotation.y += data.rotY;
          mesh.position.y += Math.sin(t + data.offset) * 0.0015;
        });
      }
      camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.015;
      camera.position.y += (-mouseY * 0.25 - camera.position.y) * 0.015;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      shapes.forEach(({ mesh }) => scene.remove(mesh));
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute left-0 top-0 h-full w-full"
    />
  );
}
