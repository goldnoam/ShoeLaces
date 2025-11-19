import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface SneakerProps {
  activeStep: number;
  highlightTrigger?: number;
  [key: string]: any;
}

// A simple procedural sneaker built from primitives
const Sneaker: React.FC<SneakerProps> = ({ activeStep, highlightTrigger = 0, ...props }) => {
  const group = useRef<THREE.Group>(null);
  const leftLoopRef = useRef<THREE.Mesh>(null);
  const rightLoopRef = useRef<THREE.Mesh>(null);
  
  // Refs for the base laces to animate crossing
  const baseLace1Ref = useRef<THREE.Mesh>(null);
  const baseLace2Ref = useRef<THREE.Mesh>(null);

  const flashRef = useRef(0); // Controls temporary flash intensity
  
  // Reset or trigger flash when highlightTrigger changes
  useEffect(() => {
    if (highlightTrigger > 0) {
      flashRef.current = 1.5; // High intensity for the flash
    }
  }, [highlightTrigger]);
  
  // Animation loop
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Gentle floating animation for the whole shoe
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.5) * 0.2;
      group.current.position.y = Math.sin(t * 1) * 0.1;
    }

    // Decay flash effect
    if (flashRef.current > 0) {
      flashRef.current = Math.max(0, flashRef.current - delta * 2.5);
    }

    // Loop Pulse Animation
    // If flashing, we want to exaggerate the scale temporarily too
    const flashScale = flashRef.current * 0.1;
    const pulse = 1 + Math.sin(t * 8) * 0.15; 
    const baseScale = activeStep >= 2 ? 1.1 : 1.0; 

    // Animate Left Loop
    if (leftLoopRef.current) {
      const shouldPulse = activeStep === 2 || activeStep === 4;
      const currentScale = (baseScale * (shouldPulse ? pulse : 1)) + flashScale;
      leftLoopRef.current.scale.setScalar(currentScale);
    }

    // Animate Right Loop
    if (rightLoopRef.current) {
      const shouldPulse = activeStep === 3 || activeStep === 4;
      const currentScale = (baseScale * (shouldPulse ? pulse : 1)) + flashScale;
      rightLoopRef.current.scale.setScalar(currentScale);
    }

    // --- Dynamic Lace Crossing Animation ---
    if (baseLace1Ref.current && baseLace2Ref.current) {
      const isCrossed = activeStep >= 1;
      const speed = 3;
      
      // Define animation states:
      // Step 0 (Start): Laces are open, parallel-ish.
      // Step 1+ (Cross): Laces form an X.
      // Step 2+ (Loops): Tighten the X slightly.
      
      const tighten = activeStep >= 2 ? 0.1 : 0;
      
      // Target Z rotations (Leaning left/right to form X)
      // Open: Small angle (+/- 0.15). Crossed: Large angle (+/- 0.6).
      const targetZ1 = isCrossed ? -(0.6 + tighten) : -0.15; 
      const targetZ2 = isCrossed ? (0.6 + tighten) : 0.15;
      
      // Add idle breathing motion when open to suggest "grab me"
      const idleMotion = !isCrossed ? Math.sin(t * 2.5) * 0.05 : 0;

      // Smoothly interpolate current rotation to target
      const currentZ1 = baseLace1Ref.current.rotation.z;
      const currentZ2 = baseLace2Ref.current.rotation.z;
      
      baseLace1Ref.current.rotation.z = THREE.MathUtils.lerp(currentZ1, targetZ1 + idleMotion, delta * speed);
      baseLace2Ref.current.rotation.z = THREE.MathUtils.lerp(currentZ2, targetZ2 - idleMotion, delta * speed);
      
      // Ensure X rotation matches tongue slant (-0.5)
      const baseTiltX = -0.5;
      baseLace1Ref.current.rotation.x = baseTiltX;
      baseLace2Ref.current.rotation.x = baseTiltX;
    }
  });

  const baseLaceColor = "#fbbf24";
  const highlightColor = "#ff5500"; // Orange/Red glow
  const flashColor = "#ffffff"; // White hot flash

  const getMaterialProps = (isHighlighted: boolean) => {
    // Mix colors: if flashing strongly, go white, otherwise use highlight or base
    const useFlashColor = flashRef.current > 0.5;
    
    return {
      color: useFlashColor ? flashColor : (isHighlighted ? highlightColor : baseLaceColor),
      emissive: (isHighlighted || flashRef.current > 0) ? highlightColor : "#000000",
      // Combine static highlight intensity with temporary flash intensity
      emissiveIntensity: (isHighlighted ? 0.8 : 0) + flashRef.current,
    };
  };

  // Visual Feedback Mapping:
  const highlightBase = activeStep === 0 || activeStep === 1;
  const highlightLeftLoop = activeStep === 2 || activeStep === 4;
  const highlightRightLoop = activeStep === 3 || activeStep === 4;
  const highlightAll = activeStep >= 5;

  return (
    <group ref={group} {...props} dispose={null}>
      {/* Sole */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[1.2, 0.2, 2.5]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      
      {/* Main Body */}
      <mesh position={[0, 0.3, 0.2]}>
        <boxGeometry args={[1.1, 0.8, 1.8]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          roughness={0.5}
          metalness={0.1}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Toe Cap */}
      <mesh position={[0, 0.1, 1.2]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.6, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>

      {/* Tongue */}
      <mesh position={[0, 0.8, 0.5]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.8, 0.1, 1]} />
        <meshStandardMaterial color="#2563eb" roughness={0.7} />
      </mesh>

      {/* Laces Group */}
      <group position={[0, 0.85, 0.5]}>
         {/* Base Crossed Laces - Animated */}
         {/* Note: Rotation Z is animated in useFrame. Initial state is 'Open'. */}
         <mesh ref={baseLace1Ref} position={[0.08, 0, 0]} rotation={[-0.5, 0, -0.15]}>
            <capsuleGeometry args={[0.05, 0.85, 4, 8]} />
            <meshStandardMaterial {...getMaterialProps(highlightBase || highlightAll)} />
         </mesh>
         <mesh ref={baseLace2Ref} position={[-0.08, 0, 0]} rotation={[-0.5, 0, 0.15]}>
            <capsuleGeometry args={[0.05, 0.85, 4, 8]} />
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
         <meshStandardMaterial color="#1d4ed8" roughness={0.8} />
      </mesh>
    </group>
  );
}

interface ShoeViewerProps {
  activeStep: number;
  highlightTrigger?: number;
  labels: {
    ready: string;
    look: string;
  };
}

export const ShoeViewer: React.FC<ShoeViewerProps> = ({ activeStep, highlightTrigger, labels }) => {
  return (
    <div className="w-full h-64 md:h-96 bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-xl border-2 border-slate-700 relative">
      <Canvas shadows camera={{ position: [3, 2, 3], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.5} shadow-mapSize={2048} castShadow />
        <Sneaker position={[0, 0, 0]} activeStep={activeStep} highlightTrigger={highlightTrigger} />
        <Environment preset="night" />
        {/* Adjusted Contact Shadows for a softer, more grounded look */}
        <ContactShadows position={[0, -0.4, 0]} opacity={0.3} scale={20} blur={3} far={3} color="#000000" />
        <OrbitControls enableZoom={false} autoRotate={activeStep === 0} autoRotateSpeed={2} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />
      </Canvas>
      
      {/* Overlay Instruction for 3D */}
      <div className="absolute bottom-4 right-4 rtl:right-4 ltr:left-4 bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-xs text-blue-300 font-bold shadow-sm pointer-events-none border border-slate-700">
        {activeStep === 0 ? labels.ready : labels.look}
      </div>
    </div>
  );
};
