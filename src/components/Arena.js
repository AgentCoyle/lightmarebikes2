import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Arena = ({ 
  size = 100, 
  gridDivisions = 50, 
  gridColor = "#00BFFF", 
  wallHeight = 10,
  wallThickness = 1,
  wallColor = "#333333",
  wallGlowColor = "#00BFFF"
}) => {
  const { scene } = useThree();
  
  // Create materials for the floor and walls
  const floorMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: "#000000",
      roughness: 0.4,
      metalness: 0.5,
      emissive: "#000000",
    });
    return mat;
  }, []);
  
  // Wall material with glow effect
  const wallMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.2,
      metalness: 0.8,
      emissive: wallGlowColor,
      emissiveIntensity: 0.2,
    });
    return mat;
  }, [wallColor, wallGlowColor]);
  
  // Create grid texture for the floor
  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    
    // Fill with black
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    context.strokeStyle = gridColor;
    context.lineWidth = 1;
    context.globalAlpha = 0.15;
    
    const step = canvas.width / gridDivisions;
    
    // Draw grid
    for (let i = 0; i <= gridDivisions; i++) {
      // Vertical lines
      context.beginPath();
      context.moveTo(i * step, 0);
      context.lineTo(i * step, canvas.height);
      context.stroke();
      
      // Horizontal lines
      context.beginPath();
      context.moveTo(0, i * step);
      context.lineTo(canvas.width, i * step);
      context.stroke();
    }
    
    // Add a stronger central cross
    context.globalAlpha = 0.5;
    context.lineWidth = 2;
    
    // Vertical center line
    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.stroke();
    
    // Horizontal center line
    context.beginPath();
    context.moveTo(0, canvas.height / 2);
    context.lineTo(canvas.width, canvas.height / 2);
    context.stroke();
    
    // Draw concentric circles
    context.globalAlpha = 0.1;
    for (let r = 1; r <= 5; r++) {
      context.beginPath();
      context.arc(canvas.width / 2, canvas.height / 2, (r * canvas.width) / 12, 0, Math.PI * 2);
      context.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }, [gridColor, gridDivisions]);
  
  // Apply the grid texture to the floor material
  floorMaterial.map = gridTexture;
  
  // Add ambient light to the scene
  useMemo(() => {
    const ambientLight = new THREE.AmbientLight(0x333333, 0.5);
    scene.add(ambientLight);
    
    return () => {
      scene.remove(ambientLight);
    };
  }, [scene]);
  
  const halfSize = size / 2;
  
  return (
    <group>
      {/* Floor */}
      <mesh 
        receiveShadow 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]} 
        material={floorMaterial}
      >
        <planeGeometry args={[size, size]} />
      </mesh>
      
      {/* Walls */}
      {/* North Wall */}
      <mesh 
        castShadow 
        receiveShadow 
        position={[0, wallHeight / 2, -halfSize - wallThickness / 2]} 
        material={wallMaterial}
      >
        <boxGeometry args={[size + wallThickness * 2, wallHeight, wallThickness]} />
      </mesh>
      
      {/* South Wall */}
      <mesh 
        castShadow 
        receiveShadow 
        position={[0, wallHeight / 2, halfSize + wallThickness / 2]} 
        material={wallMaterial}
      >
        <boxGeometry args={[size + wallThickness * 2, wallHeight, wallThickness]} />
      </mesh>
      
      {/* East Wall */}
      <mesh 
        castShadow 
        receiveShadow 
        position={[halfSize + wallThickness / 2, wallHeight / 2, 0]} 
        material={wallMaterial}
      >
        <boxGeometry args={[wallThickness, wallHeight, size]} />
      </mesh>
      
      {/* West Wall */}
      <mesh 
        castShadow 
        receiveShadow 
        position={[-halfSize - wallThickness / 2, wallHeight / 2, 0]} 
        material={wallMaterial}
      >
        <boxGeometry args={[wallThickness, wallHeight, size]} />
      </mesh>
      
      {/* Add wall edge glow */}
      <mesh position={[0, 0, -halfSize]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size, 0.2]} />
        <meshStandardMaterial 
          color={wallGlowColor} 
          emissive={wallGlowColor} 
          emissiveIntensity={1} 
          transparent={true} 
          opacity={0.8} 
        />
      </mesh>
      
      <mesh position={[0, 0, halfSize]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size, 0.2]} />
        <meshStandardMaterial 
          color={wallGlowColor} 
          emissive={wallGlowColor} 
          emissiveIntensity={1} 
          transparent={true} 
          opacity={0.8} 
        />
      </mesh>
      
      <mesh position={[-halfSize, 0, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[size, 0.2]} />
        <meshStandardMaterial 
          color={wallGlowColor} 
          emissive={wallGlowColor} 
          emissiveIntensity={1} 
          transparent={true} 
          opacity={0.8} 
        />
      </mesh>
      
      <mesh position={[halfSize, 0, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[size, 0.2]} />
        <meshStandardMaterial 
          color={wallGlowColor} 
          emissive={wallGlowColor} 
          emissiveIntensity={1} 
          transparent={true} 
          opacity={0.8} 
        />
      </mesh>
    </group>
  );
};

export default Arena; 