import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface SneakerProps {
  activeStep: number;
  [key: string]: any;
}

// A simple procedural sneaker built from primitives
const Sneaker: React.FC<SneakerProps> = ({ activeStep, ...props }) => {
  const group = useRef<THREE.Group>(null);
  const leftLoopRef = useRef<THREE.Mesh>(null);
  const rightLoopRef = useRef<THREE.Mesh>(null);
  
  // Animation loop
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Gentle floating animation for the whole shoe
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.5) * 0.2;
      group.current.position.y = Math.sin(t * 1) * 0.1;
    }

    // Loop Pulse Animation
    const pulse = 1 + Math.sin(t * 8) * 0.15; // Oscillation between ~0.85 and 1.15 relative to base
    const baseScale = activeStep >= 2 ? 1.1 : 1.0; // Base size logic

    // Animate Left Loop
    if (leftLoopRef.current) {
      // Pulse on step 2 (make first loop) or step 4 (tie)
      const shouldPulse = activeStep === 2 || activeStep === 4;
      const currentScale = baseScale * (shouldPulse ? pulse : 1);
      leftLoopRef.current.scale.setScalar(currentScale);
    }

    // Animate Right Loop
    if (rightLoopRef.current) {
      // Pulse on step 3 (make second loop) or step 4 (tie)
      const shouldPulse = activeStep === 3 || activeStep === 4;
      const currentScale = baseScale * (shouldPulse ? pulse : 1);
      rightLoopRef.current.scale.setScalar(currentScale);
    }
  });

  const baseLaceColor = "#fbbf24";
  const highlightColor = "#ff5500"; // Orange/Red glow

  const getMaterialProps = (isHighlighted: boolean) => ({
    color: isHighlighted ? highlightColor : baseLaceColor,
    emissive: isHighlighted ? highlightColor : "#000000",
    emissiveIntensity: isHighlighted ? 0.8 : 0,
  });

  // Visual Feedback Mapping:
  // Step 0/1: Cross/Start -> Highlight Base Laces
  // Step 2: Loop 1 -> Highlight Left Loop
  // Step 3: Loop 2 -> Highlight Right Loop
  // Step 4: Tie -> Highlight Center/Loops
  // Step 5: Done -> Highlight All

  const highlightBase = activeStep === 0 || activeStep === 1;
  const highlightLeftLoop = activeStep === 2 || activeStep === 4;
  const highlightRightLoop = activeStep === 3 || activeStep === 4;
  const highlightAll = activeStep >= 5;

  return (
    <group ref={group} {...props} dispose={null}>
      {/* Sole */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[1.2, 0.2, 2.5]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      
      {/* Main Body */}
      <mesh position={[0, 0.3, 0.2]}>
        <boxGeometry args={[1.1, 0.8, 1.8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      {/* Toe Cap */}
      <mesh position={[0, 0.1, 1.2]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.6, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Tongue */}
      <mesh position={[0, 0.8, 0.5]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.8, 0.1, 1]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>

      {/* Laces Group */}
      <group position={[0, 0.85, 0.5]}>
         {/* Base Crossed Laces */}
         <mesh position={[0, 0, 0]} rotation={[0, 0.7, 0]}>
            <capsuleGeometry args={[0.05, 0.8, 4, 8]} />
            <meshStandardMaterial {...getMaterialProps(highlightBase || highlightAll)} />
         </mesh>
         <mesh position={[0, 0, 0]} rotation={[0, -0.7, 0]}>
            <capsuleGeometry args={[0.05, 0.8, 4, 8]} />
            <meshStandardMaterial {...getMaterialProps(highlightBase || highlightAll)} />
         </mesh>
         
         {/* Loops Group */}
         {/* Left Loop */}
         <mesh 
           ref={leftLoopRef}
           position={[0.3, 0.2, -0.2]} 
           rotation={[0, 0, 0.5]}
         >
            <torusGeometry args={[0.2, 0.05, 16, 32]} />
            <meshStandardMaterial {...getMaterialProps(highlightLeftLoop || highlightAll)} />
         </mesh>
         
         {/* Right Loop */}
         <mesh 
           ref={rightLoopRef}
           position={[-0.3, 0.2, -0.2]} 
           rotation={[0, 0, -0.5]}
         >
            <torusGeometry args={[0.2, 0.05, 16, 32]} />
            <meshStandardMaterial {...getMaterialProps(highlightRightLoop || highlightAll)} />
         </mesh>
         
         {/* Knot Center (Visible only on later steps) */}
         {activeStep >= 3 && (
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial {...getMaterialProps(highlightAll)} />
            </mesh>
         )}
      </group>

      {/* Ankle Collar */}
      <mesh position={[0, 0.8, -0.8]}>
         <cylinderGeometry args={[0.6, 0.6, 0.5, 32]} />
         <meshStandardMaterial color="#1d4ed8" />
      </mesh>
    </group>
  );
}

interface ShoeViewerProps {
  activeStep: number;
}

export const ShoeViewer: React.FC<ShoeViewerProps> = ({ activeStep }) => {
  return (
    <div className="w-full h-64 md:h-96 bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-xl border-2 border-slate-700 relative">
      <Canvas shadows camera={{ position: [3, 2, 3], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.5} shadow-mapSize={2048} castShadow />
        <Sneaker position={[0, 0, 0]} activeStep={activeStep} />
        <Environment preset="night" />
        <ContactShadows position={[0, -0.4, 0]} opacity={0.7} scale={10} blur={2} far={0.8} color="#000000" />
        <OrbitControls enableZoom={false} autoRotate={activeStep === 0} autoRotateSpeed={2} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />
      </Canvas>
      
      {/* Overlay Instruction for 3D */}
      <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-xs text-blue-300 font-bold shadow-sm pointer-events-none border border-slate-700">
        {activeStep === 0 ? 'הנעל מוכנה!' : 'שים לב לחלקים הזוהרים'}
      </div>
    </div>
  );
};