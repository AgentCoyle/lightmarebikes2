import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshStandardMaterial } from 'three';
import { Text } from '@react-three/drei';

const LightBike = ({ 
  position, 
  rotation, 
  color, 
  isPlayer, 
  isActive = true,
  velocity = 0.5,
  name,
  scale = 5
}) => {
  const bikeRef = useRef();
  
  // Create glowing materials
  const bodyMaterial = useMemo(() => new MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.8,
    metalness: 0.9,
    roughness: 0.1,
  }), [color]);
  
  const glowMaterial = useMemo(() => new MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.9,
    metalness: 0.2,
    roughness: 0,
  }), [color]);
  
  const accentMaterial = useMemo(() => new MeshStandardMaterial({
    color: '#ffffff',
    emissive: color,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.95,
    metalness: 1.0,
    roughness: 0,
  }), [color]);
  
  // Pulse effect for bikes
  useFrame(({ clock }) => {
    if (bikeRef.current && isActive) {
      const t = clock.getElapsedTime();
      bikeRef.current.children.forEach(child => {
        if (child.material === glowMaterial) {
          // Pulse the glow elements
          child.material.emissiveIntensity = 1.2 + Math.sin(t * 5) * 0.3;
        }
        if (child.material === accentMaterial) {
          // Pulse the accent elements more intensely
          child.material.emissiveIntensity = 1.5 + Math.sin(t * 7) * 0.5;
        }
      });
    }
  });
  
  return (
    <group ref={bikeRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Main bike body - longer and sleeker */}
      <mesh material={bodyMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.4, 3.2]} />
      </mesh>
      
      {/* Front elongated section */}
      <mesh position={[0, 0, 1.8]} material={bodyMaterial} castShadow>
        <boxGeometry args={[0.4, 0.25, 1.0]} />
      </mesh>
      
      {/* Front angled fairing */}
      <mesh position={[0, 0.2, 2.4]} rotation={[Math.PI / 6, 0, 0]} material={bodyMaterial} castShadow>
        <boxGeometry args={[0.5, 0.2, 0.6]} />
      </mesh>
      
      {/* Rider silhouette - more streamlined */}
      <mesh position={[0, 0.45, 0.2]} material={bodyMaterial} castShadow>
        <boxGeometry args={[0.5, 0.5, 1.2]} />
      </mesh>
      
      {/* Rider helmet */}
      <mesh position={[0, 0.6, 0.8]} material={bodyMaterial} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
      </mesh>
      
      {/* Rear section - tapered */}
      <mesh position={[0, 0.1, -1.4]} rotation={[-Math.PI / 12, 0, 0]} material={bodyMaterial} castShadow>
        <boxGeometry args={[0.6, 0.3, 0.8]} />
      </mesh>
      
      {/* Wheels - larger and more Tron-like */}
      <mesh position={[0, -0.3, -1.2]} rotation={[0, 0, Math.PI / 2]} material={glowMaterial}>
        <torusGeometry args={[0.35, 0.04, 16, 24]} />
      </mesh>
      
      <mesh position={[0, -0.3, 1.5]} rotation={[0, 0, Math.PI / 2]} material={glowMaterial}>
        <torusGeometry args={[0.35, 0.04, 16, 24]} />
      </mesh>
      
      {/* Wheel covers - iconic Tron feature */}
      <mesh position={[0, -0.3, -1.2]} rotation={[Math.PI / 2, 0, 0]} material={bodyMaterial}>
        <cylinderGeometry args={[0.38, 0.38, 0.1, 24, 1, true]} />
      </mesh>
      
      <mesh position={[0, -0.3, 1.5]} rotation={[Math.PI / 2, 0, 0]} material={bodyMaterial}>
        <cylinderGeometry args={[0.38, 0.38, 0.1, 24, 1, true]} />
      </mesh>
      
      {/* Main light strip along bottom */}
      <mesh position={[0, -0.22, 0]} material={glowMaterial}>
        <boxGeometry args={[0.75, 0.03, 3.4]} />
      </mesh>
      
      {/* Side light strips - iconic Tron feature */}
      <mesh position={[0.37, 0, 0]} material={glowMaterial}>
        <boxGeometry args={[0.03, 0.5, 3.4]} />
      </mesh>
      
      <mesh position={[-0.37, 0, 0]} material={glowMaterial}>
        <boxGeometry args={[0.03, 0.5, 3.4]} />
      </mesh>
      
      {/* Front light strip */}
      <mesh position={[0, 0, 2.35]} material={accentMaterial}>
        <boxGeometry args={[0.5, 0.2, 0.05]} />
      </mesh>
      
      {/* Accent light strips */}
      <mesh position={[0.36, 0.25, 1.0]} material={accentMaterial}>
        <boxGeometry args={[0.02, 0.02, 2.0]} />
      </mesh>
      
      <mesh position={[-0.36, 0.25, 1.0]} material={accentMaterial}>
        <boxGeometry args={[0.02, 0.02, 2.0]} />
      </mesh>
      
      {/* Engine glow */}
      <mesh position={[0, 0, -1.7]} material={accentMaterial}>
        <boxGeometry args={[0.4, 0.2, 0.1]} />
      </mesh>
    </group>
  );
};

export default LightBike; 