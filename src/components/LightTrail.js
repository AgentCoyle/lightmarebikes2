import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LightTrail = ({ 
  points, 
  color, 
  thickness = 0.2,
  height = 5,
  pulseSpeed = 2
}) => {
  const trailRef = useRef();
  
  // Create the curve from points
  const curve = useMemo(() => {
    if (points.length < 2) return null;
    return new THREE.CatmullRomCurve3(
      points.map(point => new THREE.Vector3(point[0], 0, point[1]))
    );
  }, [points]);
  
  // Create material with glow effect
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
  }, [color]);
  
  // Add pulsing effect to the trail
  useFrame(({ clock }) => {
    if (trailRef.current) {
      const t = clock.getElapsedTime();
      material.emissiveIntensity = 0.8 + Math.sin(t * pulseSpeed) * 0.2;
    }
  });
  
  // If there aren't enough points, don't render anything
  if (!curve || points.length < 2) return null;
  
  // Generate the trail geometry
  const segments = points.length * 3; // More segments for smoother curves
  const tubeGeometry = new THREE.TubeGeometry(curve, segments, thickness, 8, false);
  
  return (
    <group ref={trailRef}>
      {/* The main light tube */}
      <mesh geometry={tubeGeometry} material={material} />
      
      {/* Vertical light beams at each point (except the last one, which is the bike's current position) */}
      {points.slice(0, -1).map((point, index) => (
        <mesh 
          key={index} 
          position={[point[0], height / 2, point[1]]} 
          material={material}
        >
          <boxGeometry args={[thickness, height, thickness]} />
        </mesh>
      ))}
    </group>
  );
};

export default LightTrail; 