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
  scale = 1
}) => {
  const bikeRef = useRef();
  
  // Create glowing materials
  const bodyMaterial = useMemo(() => new MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.8,
    metalness: 0.8,
    roughness: 0.2,
  }), [color]);
  
  const glowMaterial = useMemo(() => new MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 1,
    transparent: true,
    opacity: 0.8,
    metalness: 0.2,
    roughness: 0,
  }), [color]);
  
  // Pulse effect for bikes
  useFrame(({ clock }) => {
    if (bikeRef.current && isActive) {
      const t = clock.getElapsedTime();
      bikeRef.current.children.forEach(child => {
        if (child.material === glowMaterial) {
          // Pulse the glow elements
          child.material.emissiveIntensity = 0.8 + Math.sin(t * 5) * 0.2;
        }
      });
    }
  });
  
  return (
    <group ref={bikeRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Bike body */}
      <mesh material={bodyMaterial} castShadow receiveShadow>
        <boxGeometry args={[2, 0.5, 0.8]} />
      </mesh>
      
      {/* Front section */}
      <mesh position={[1, 0, 0]} material={bodyMaterial} castShadow>
        <boxGeometry args={[0.6, 0.3, 0.4]} />
      </mesh>
      
      {/* Rider silhouette */}
      <mesh position={[0, 0.5, 0]} material={bodyMaterial} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.5]} />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[-0.7, -0.3, 0]} rotation={[0, 0, Math.PI / 2]} material={glowMaterial}>
        <torusGeometry args={[0.3, 0.06, 16, 24]} />
      </mesh>
      
      <mesh position={[0.7, -0.3, 0]} rotation={[0, 0, Math.PI / 2]} material={glowMaterial}>
        <torusGeometry args={[0.3, 0.06, 16, 24]} />
      </mesh>
      
      {/* Glow elements */}
      <mesh position={[0, -0.05, 0]} material={glowMaterial}>
        <boxGeometry args={[2.2, 0.05, 0.9]} />
      </mesh>
      
      <mesh position={[0, 0, 0.45]} material={glowMaterial}>
        <boxGeometry args={[2.2, 0.6, 0.05]} />
      </mesh>
      
      <mesh position={[0, 0, -0.45]} material={glowMaterial}>
        <boxGeometry args={[2.2, 0.6, 0.05]} />
      </mesh>
      
      {/* Optional name label */}
      {name && (
        <Text
          position={[0, 1.2, 0]}
          rotation={[0, 0, 0]}
          fontSize={0.5}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {name}
        </Text>
      )}
    </group>
  );
};

export default LightBike; 