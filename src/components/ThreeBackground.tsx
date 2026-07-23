"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Sparkles } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

function ShootingStar() {
  const ref = useRef<THREE.Mesh>(null);
  const [initials] = useState(() => ({
    speed: Math.random() * 15 + 15,
    delay: Math.random() * 8,
    angle: Math.PI / 2 + (Math.random() * 0.4 - 0.2)
  }));
  const speed = useRef(initials.speed);
  const delay = useRef(initials.delay);
  const timer = useRef(0);
  const angle = useRef(initials.angle);

  const resetStar = () => {
    if (!ref.current) return;
    // Start anywhere across the top of the screen
    const startX = -20 + Math.random() * 40;
    const startY = 15 + Math.random() * 10;
    const startZ = -10 + Math.random() * 15;
    ref.current.position.set(startX, startY, startZ);
    delay.current = Math.random() * 3; 
    speed.current = Math.random() * 20 + 30; // Very fast
    timer.current = 0;
    // Cylinder is along Y axis, so offset by -PI/2 to align with movement vector
    ref.current.rotation.set(0, 0, -angle.current - Math.PI / 2);
  };

  useFrame((state, delta) => {
    if (!ref.current) return;
    timer.current += delta;
    if (timer.current > delay.current) {
      ref.current.position.x += Math.cos(angle.current) * speed.current * delta;
      ref.current.position.y -= Math.sin(angle.current) * speed.current * delta;
      
      // Reset if it goes below the screen
      if (ref.current.position.y < -15) {
        resetStar();
      }
    } else {
      ref.current.position.set(100, 100, 100); // Hide while delayed
    }
  });

  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[0.01, 0.06, 5, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
    </mesh>
  );
}

function SpaceDust() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Deep Space Stars */}
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1.5} />
      
      {/* Colorful Galaxy Dust/Sparkles */}
      <Sparkles count={500} scale={20} size={3} speed={0.2} opacity={0.5} color="#4f46e5" /> {/* Indigo */}
      <Sparkles count={300} scale={15} size={2} speed={0.4} opacity={0.6} color="#ec4899" /> {/* Pink */}
      <Sparkles count={200} scale={25} size={4} speed={0.3} opacity={0.4} color="#facc15" /> {/* Gold */}
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-[-5] bg-[#000005] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={1} />
        
        {/* The rotating space environment */}
        <SpaceDust />
        
        {/* Shooting Stars */}
        {Array.from({ length: 7 }).map((_, i) => (
          <ShootingStar key={i} />
        ))}
      </Canvas>
    </div>
  );
}
