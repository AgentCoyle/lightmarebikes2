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
  
  // Generate wall geometry
  const wallGeometry = useMemo(() => {
    if (points.length < 2) return null;
    
    // Create wall segments between each pair of points
    const wallSegments = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const startPoint = points[i];
      const endPoint = points[i + 1];
      
      // Calculate direction vector between points
      const dirX = endPoint[0] - startPoint[0];
      const dirZ = endPoint[1] - startPoint[1];
      const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
      
      // Skip if points are too close
      if (length < 0.01) continue;
      
      // Create wall geometry
      const wallGeometry = new THREE.BoxGeometry(thickness, height, length);
      
      // Position at midpoint between the two points
      const midX = (startPoint[0] + endPoint[0]) / 2;
      const midZ = (startPoint[1] + endPoint[1]) / 2;
      
      // Calculate rotation to align with direction
      const angle = Math.atan2(dirZ, dirX);
      
      // Create wall segment
      wallSegments.push({
        geometry: wallGeometry,
        position: [midX, height / 2, midZ],
        rotation: [0, -angle, 0]
      });
    }
    
    return wallSegments;
  }, [points, height, thickness]);
  
  // Add pulsing effect to the trail
  useFrame(({ clock }) => {
    if (trailRef.current) {
      const t = clock.getElapsedTime();
      material.emissiveIntensity = 0.8 + Math.sin(t * pulseSpeed) * 0.2;
    }
  });
  
  // If there aren't enough points, don't render anything
  if (!curve || points.length < 2) return null;
  
  // Generate the trail geometry for the ground trail
  const segments = points.length * 3; // More segments for smoother curves
  const tubeGeometry = new THREE.TubeGeometry(curve, segments, thickness, 8, false);
  
  return (
    <group ref={trailRef}>
      {/* The main light tube on the ground */}
      <mesh geometry={tubeGeometry} material={material} />
      
      {/* The wall segments */}
      {wallGeometry && wallGeometry.map((segment, index) => (
        <mesh
          key={index}
          geometry={segment.geometry}
          material={material}
          position={segment.position}
          rotation={segment.rotation}
        />
      ))}
    </group>
  );
};

export default LightTrail; 