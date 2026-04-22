"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Project } from "@/lib/portfolio-data";

interface ProjectThumbProps {
  color: number;
  geometry: Project["geometry"];
}

function makeGeometry(kind: Project["geometry"]): THREE.BufferGeometry {
  switch (kind) {
    case "torus":
      return new THREE.TorusGeometry(0.5, 0.18, 16, 32);
    case "octahedron":
      return new THREE.OctahedronGeometry(0.55, 0);
    case "icosahedron":
      return new THREE.IcosahedronGeometry(0.55, 1);
    case "torus-knot":
      return new THREE.TorusKnotGeometry(0.35, 0.1, 64, 16);
  }
}

export function ProjectThumb({ color, geometry }: ProjectThumbProps) {
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
      50,
    );
    camera.position.z = 3.5;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(color, 0.7);
    dirLight.position.set(3, 3, 3);
    scene.add(dirLight);

    const geo = makeGeometry(geometry);
    const material = new THREE.MeshPhysicalMaterial({
      color,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geo, material);
    scene.add(mesh);

    let rafId = 0;
    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;
      mesh.rotation.x = t * 0.15;
      mesh.rotation.y = t * 0.25;
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
      geo.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [color, geometry]);

  return (
    <div
      className="h-[200px] w-full"
      style={{ background: "var(--bg)" }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
