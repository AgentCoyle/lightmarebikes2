import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CyberBackground = ({ size = 1500 }) => {
  const groupRef = useRef();
  const gridRef = useRef();
  const particlesRef = useRef();
  const cityRef = useRef();
  
  // Use refs for materials so they can be animated
  const gridMaterialRef = useRef(
    new THREE.LineBasicMaterial({
      color: new THREE.Color('#00BFFF'),
      transparent: true,
      opacity: 0.3,
    })
  );
  
  const particleMaterialRef = useRef(
    new THREE.PointsMaterial({
      size: 4,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
  );
  
  // Create particles for the background with useMemo
  const particleData = useMemo(() => {
    const particleCount = 200;
    const particlePositions = [];
    const particleColors = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Random positions in a hemisphere above the arena
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      const distance = size * (0.8 + Math.random() * 0.7);
      
      const x = distance * Math.sin(phi) * Math.cos(theta);
      const y = distance * Math.cos(phi) + 100; // Keep particles above the horizon
      const z = distance * Math.sin(phi) * Math.sin(theta);
      
      particlePositions.push(x, y, z);
      
      // Alternate between cyberpunk colors
      const colorIndex = Math.floor(Math.random() * 4);
      const colors = [
        new THREE.Color('#00BFFF'), // Cyan
        new THREE.Color('#1E90FF'), // Dodger Blue
        new THREE.Color('#A020F0'), // Purple
        new THREE.Color('#4B0082')  // Indigo
      ];
      
      const color = colors[colorIndex];
      particleColors.push(color.r, color.g, color.b);
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));
    
    return { particleGeometry };
  }, [size]);
  
  // Helper function to create a window texture
  const createWindowTexture = (color, windowSize = 64) => {
    const canvas = document.createElement('canvas');
    canvas.width = windowSize;
    canvas.height = windowSize;
    const ctx = canvas.getContext('2d');
    
    // Fill with black
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, windowSize, windowSize);
    
    // Create window grid pattern
    const rows = 8;
    const cols = 8;
    const windowMargin = 1;
    const windowWidth = Math.floor(windowSize / cols) - windowMargin;
    const windowHeight = Math.floor(windowSize / rows) - windowMargin;
    
    // Draw lit and unlit windows
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * (windowWidth + windowMargin);
        const y = row * (windowHeight + windowMargin);
        
        // 70% chance of window being lit
        if (Math.random() < 0.7) {
          // Window color with slight variation
          const brightness = 0.7 + Math.random() * 0.3;
          ctx.fillStyle = color;
          ctx.globalAlpha = brightness;
          ctx.fillRect(x, y, windowWidth, windowHeight);
        }
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };
  
  // Create buildings with useMemo
  const buildingData = useMemo(() => {
    const buildingCount = 40;
    const buildings = [];
    const buildingMaterials = [];
    
    // Refined color palette focusing on blues, purples, and cyans
    const cyberpunkColors = [
      '#00BFFF', // Cyan
      '#00FFFF', // Aqua
      '#1E90FF', // Dodger Blue
      '#0000FF', // Blue
      '#8A2BE2', // Blue Violet
      '#9400D3', // Dark Violet
      '#A020F0', // Purple
      '#4B0082', // Indigo
      '#6A5ACD', // Slate Blue
      '#7B68EE', // Medium Slate Blue
      '#00CED1', // Dark Turquoise
      '#5F9EA0', // Cadet Blue
    ];
    
    for (let i = 0; i < buildingCount; i++) {
      // Random position along a circle around the arena
      const angle = Math.random() * Math.PI * 2;
      const distance = size * 0.7;
      const x = distance * Math.cos(angle);
      const z = distance * Math.sin(angle);
      
      // Define building type
      const buildingType = Math.floor(Math.random() * 5); // 5 different building types
      
      // Base height and dimensions
      const baseWidth = 20 + Math.random() * 30;
      const baseDepth = 20 + Math.random() * 30;
      const baseHeight = 100 + Math.random() * 300;
      
      // Choose a color for the building
      const colorIndex = Math.floor(Math.random() * cyberpunkColors.length);
      const baseColor = new THREE.Color(cyberpunkColors[colorIndex]);
      const emissiveColor = new THREE.Color(cyberpunkColors[colorIndex]);
      
      // Create window texture
      const windowTexture = createWindowTexture(cyberpunkColors[colorIndex]);
      
      // Material for buildings with windows
      const buildingMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#111122'), // Darker blue-black
        roughness: 0.4,
        metalness: 0.8,
        map: windowTexture,
        emissive: emissiveColor,
        emissiveMap: windowTexture,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.9,
      });
      
      buildingMaterials.push(buildingMaterial);
      const materialIndex = buildingMaterials.length - 1;
      
      // Material for additional glowing elements
      const glowMaterial = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: emissiveColor,
        emissiveIntensity: 1.0,
        transparent: true,
        opacity: 0.8,
      });
      
      buildingMaterials.push(glowMaterial);
      const glowMaterialIndex = buildingMaterials.length - 1;
      
      // Create building based on type
      let buildingParts = [];
      
      // Position the building with its bottom exactly at grid level (-5)
      // Half the height up from grid level, plus the grid level of -5
      let position = [x, baseHeight/2 - 5, z];
      
      switch(buildingType) {
        case 0: // Skyscraper with tapering top
          {
            // Main body
            buildingParts.push({
              geometry: new THREE.BoxGeometry(baseWidth, baseHeight * 0.85, baseDepth),
              materialIndex,
              position: [0, 0, 0],
              rotation: [0, 0, 0]
            });
            
            // Tapered top
            const topWidth = baseWidth * 0.6;
            const topDepth = baseDepth * 0.6;
            const topHeight = baseHeight * 0.25;
            buildingParts.push({
              geometry: new THREE.BoxGeometry(topWidth, topHeight, topDepth),
              materialIndex,
              position: [0, baseHeight * 0.85 / 2 + topHeight / 2, 0],
              rotation: [0, 0, 0]
            });
            
            // Antenna/spire
            const spireHeight = baseHeight * 0.15;
            buildingParts.push({
              geometry: new THREE.CylinderGeometry(1, 2, spireHeight, 8),
              materialIndex: glowMaterialIndex,
              position: [0, baseHeight * 0.85 / 2 + topHeight + spireHeight/2, 0],
              rotation: [0, 0, 0]
            });
            
            // Glowing ring around top
            buildingParts.push({
              geometry: new THREE.TorusGeometry(topWidth * 0.7, 2, 16, 32),
              materialIndex: glowMaterialIndex,
              position: [0, baseHeight * 0.85 / 2 + topHeight / 2, 0],
              rotation: [Math.PI/2, 0, 0]
            });
          }
          break;
          
        case 1: // Cyberpunk pagoda-style tower
          {
            const levels = 3 + Math.floor(Math.random() * 3);
            const levelHeight = baseHeight / levels;
            
            for (let j = 0; j < levels; j++) {
              const levelWidth = baseWidth * (1 - j * 0.15);
              const levelDepth = baseDepth * (1 - j * 0.15);
              
              // Main level body
              buildingParts.push({
                geometry: new THREE.BoxGeometry(levelWidth, levelHeight * 0.8, levelDepth),
                materialIndex,
                position: [0, j * levelHeight - baseHeight/2 + levelHeight/2, 0],
                rotation: [0, 0, 0]
              });
              
              // Decorative roof/floor
              buildingParts.push({
                geometry: new THREE.BoxGeometry(levelWidth * 1.2, levelHeight * 0.1, levelDepth * 1.2),
                materialIndex: glowMaterialIndex,
                position: [0, j * levelHeight - baseHeight/2 + levelHeight, 0],
                rotation: [0, 0, 0]
              });
            }
            
            // Top antenna
            buildingParts.push({
              geometry: new THREE.CylinderGeometry(0.5, 2, levelHeight, 8),
              materialIndex: glowMaterialIndex,
              position: [0, levels * levelHeight - baseHeight/2 + levelHeight/2, 0],
              rotation: [0, 0, 0]
            });
          }
          break;
          
        case 2: // Twin towers with bridge
          {
            const towerWidth = baseWidth * 0.45;
            const towerDepth = baseDepth;
            const bridgeHeight = baseHeight * 0.7;
            const bridgeThickness = 10;
            
            // First tower
            buildingParts.push({
              geometry: new THREE.BoxGeometry(towerWidth, baseHeight, towerDepth),
              materialIndex,
              position: [-baseWidth/2 + towerWidth/2, 0, 0],
              rotation: [0, 0, 0]
            });
            
            // Second tower
            buildingParts.push({
              geometry: new THREE.BoxGeometry(towerWidth, baseHeight * 1.1, towerDepth),
              materialIndex,
              position: [baseWidth/2 - towerWidth/2, baseHeight * 0.05, 0],
              rotation: [0, 0, 0]
            });
            
            // Connecting bridge
            buildingParts.push({
              geometry: new THREE.BoxGeometry(baseWidth, bridgeThickness, towerDepth * 0.6),
              materialIndex: glowMaterialIndex,
              position: [0, bridgeHeight - baseHeight/2, 0],
              rotation: [0, 0, 0]
            });
            
            // Glowing tops
            buildingParts.push({
              geometry: new THREE.BoxGeometry(towerWidth, 10, towerDepth),
              materialIndex: glowMaterialIndex,
              position: [-baseWidth/2 + towerWidth/2, baseHeight/2, 0],
              rotation: [0, 0, 0]
            });
            
            buildingParts.push({
              geometry: new THREE.BoxGeometry(towerWidth, 10, towerDepth),
              materialIndex: glowMaterialIndex,
              position: [baseWidth/2 - towerWidth/2, baseHeight * 1.1/2 + baseHeight * 0.05, 0],
              rotation: [0, 0, 0]
            });
          }
          break;
          
        case 3: // Pyramid/ziggurat style
          {
            const levels = 4 + Math.floor(Math.random() * 3);
            const levelHeight = baseHeight / levels;
            
            for (let j = 0; j < levels; j++) {
              const scale = 1 - (j / levels);
              const levelWidth = baseWidth * scale;
              const levelDepth = baseDepth * scale;
              
              buildingParts.push({
                geometry: new THREE.BoxGeometry(levelWidth, levelHeight, levelDepth),
                materialIndex,
                position: [0, j * levelHeight - baseHeight/2 + levelHeight/2, 0],
                rotation: [0, 0, 0]
              });
              
              // Add glowing edges to each level
              if (j > 0) {
                const edgeWidth = (baseWidth * (1 - ((j-1) / levels))) - levelWidth;
                const edgeDepth = (baseDepth * (1 - ((j-1) / levels))) - levelDepth;
                
                const edgeThickness = 3;
                
                // X-axis edges
                buildingParts.push({
                  geometry: new THREE.BoxGeometry(levelWidth + edgeWidth, edgeThickness, edgeThickness),
                  materialIndex: glowMaterialIndex,
                  position: [0, j * levelHeight - baseHeight/2, levelDepth/2 + edgeThickness/2],
                  rotation: [0, 0, 0]
                });
                
                buildingParts.push({
                  geometry: new THREE.BoxGeometry(levelWidth + edgeWidth, edgeThickness, edgeThickness),
                  materialIndex: glowMaterialIndex,
                  position: [0, j * levelHeight - baseHeight/2, -levelDepth/2 - edgeThickness/2],
                  rotation: [0, 0, 0]
                });
                
                // Z-axis edges
                buildingParts.push({
                  geometry: new THREE.BoxGeometry(edgeThickness, edgeThickness, levelDepth + edgeDepth),
                  materialIndex: glowMaterialIndex,
                  position: [levelWidth/2 + edgeThickness/2, j * levelHeight - baseHeight/2, 0],
                  rotation: [0, 0, 0]
                });
                
                buildingParts.push({
                  geometry: new THREE.BoxGeometry(edgeThickness, edgeThickness, levelDepth + edgeDepth),
                  materialIndex: glowMaterialIndex,
                  position: [-levelWidth/2 - edgeThickness/2, j * levelHeight - baseHeight/2, 0],
                  rotation: [0, 0, 0]
                });
              }
            }
            
            // Top pyramid/antenna
            buildingParts.push({
              geometry: new THREE.ConeGeometry(baseWidth * 0.1, levelHeight * 2, 4),
              materialIndex: glowMaterialIndex,
              position: [0, levels * levelHeight - baseHeight/2 + levelHeight, 0],
              rotation: [0, Math.PI/4, 0]
            });
          }
          break;
          
        case 4: // Curved/unique futuristic building
          {
            // Main body - slightly curved
            buildingParts.push({
              geometry: new THREE.CylinderGeometry(baseWidth/2, baseDepth/2, baseHeight, 8),
              materialIndex,
              position: [0, 0, 0],
              rotation: [0, Math.random() * Math.PI, 0]
            });
            
            // Flying buttresses/supports
            const supportCount = 3;
            const supportHeight = baseHeight * 0.6;
            const supportWidth = 5;
            const supportRadius = baseWidth * 0.7;
            
            for (let j = 0; j < supportCount; j++) {
              const angle = (j / supportCount) * Math.PI * 2;
              buildingParts.push({
                geometry: new THREE.BoxGeometry(supportWidth, supportHeight * 0.5, supportWidth),
                materialIndex: glowMaterialIndex,
                position: [
                  Math.cos(angle) * supportRadius, 
                  -baseHeight/2 + supportHeight * 0.25, 
                  Math.sin(angle) * supportRadius
                ],
                rotation: [0, 0, 0]
              });
              
              // Horizontal connector
              buildingParts.push({
                geometry: new THREE.BoxGeometry(supportRadius, supportWidth, supportWidth),
                materialIndex: glowMaterialIndex,
                position: [
                  Math.cos(angle) * supportRadius/2, 
                  -baseHeight/2 + supportHeight * 0.4, 
                  Math.sin(angle) * supportRadius/2
                ],
                rotation: [0, angle, 0]
              });
            }
            
            // Observation deck at top
            buildingParts.push({
              geometry: new THREE.TorusGeometry(baseWidth * 0.7, 5, 16, 32),
              materialIndex: glowMaterialIndex,
              position: [0, baseHeight/2 - 10, 0],
              rotation: [Math.PI/2, 0, 0]
            });
            
            // Top spire
            buildingParts.push({
              geometry: new THREE.ConeGeometry(5, baseHeight * 0.2, 8),
              materialIndex: glowMaterialIndex,
              position: [0, baseHeight/2 + baseHeight * 0.1, 0],
              rotation: [0, 0, 0]
            });
          }
          break;
      }
      
      buildings.push({
        parts: buildingParts,
        position,
        buildingType,
        baseHeight
      });
    }
    
    return { buildings, buildingMaterials };
  }, [size]);
  
  // Create grid with useMemo
  const gridData = useMemo(() => {
    const gridSize = size * 1.5;
    const gridDivisions = 60;
    const gridGeometry = new THREE.BufferGeometry();
    const gridPositions = [];
    
    // Create a grid extending to horizon
    for (let i = 0; i <= gridDivisions; i++) {
      const x = (i / gridDivisions - 0.5) * gridSize;
      
      // X lines
      gridPositions.push(x, -5, -gridSize/2);
      gridPositions.push(x, -5, gridSize/2);
      
      // Z lines
      gridPositions.push(-gridSize/2, -5, x);
      gridPositions.push(gridSize/2, -5, x);
    }
    
    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
    
    return { gridGeometry };
  }, [size]);
  
  // Animation
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Rotate the entire background slowly
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.01;
    }
    
    // Pulse the grid
    if (gridMaterialRef.current) {
      gridMaterialRef.current.opacity = 0.2 + Math.sin(time * 0.5) * 0.1;
    }
    
    // Make particles twinkle
    if (particleMaterialRef.current) {
      particleMaterialRef.current.size = 3 + Math.sin(time) * 1;
      particleMaterialRef.current.opacity = 0.7 + Math.sin(time * 0.5) * 0.3;
    }
    
    // Make buildings pulse
    if (buildingData.buildingMaterials) {
      buildingData.buildingMaterials.forEach((material, i) => {
        if (material.emissiveIntensity !== undefined) {
          // Different pulse rates for different materials
          const pulseRate = 0.2 + (i % 5) * 0.05;
          const pulsePhase = i * 0.1;
          material.emissiveIntensity = 0.3 + Math.sin(time * pulseRate + pulsePhase) * 0.2;
        }
      });
    }
    
    // Make city skyline slowly move up and down - but never below grid level
    if (cityRef.current) {
      // Smaller vertical movement to maintain grid contact
      cityRef.current.position.y = Math.max(0, Math.sin(time * 0.1) * 2);
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Horizon grid */}
      <lineSegments 
        ref={gridRef} 
        geometry={gridData.gridGeometry} 
        material={gridMaterialRef.current} 
      />
      
      {/* Distant particles */}
      <points 
        ref={particlesRef} 
        geometry={particleData.particleGeometry} 
        material={particleMaterialRef.current} 
      />
      
      {/* City skyline - no base offset so buildings touch grid */}
      <group ref={cityRef} position={[0, 0, 0]}>
        {buildingData.buildings.map((building, buildingIndex) => (
          <group 
            key={buildingIndex} 
            position={building.position}
          >
            {building.parts.map((part, partIndex) => (
              <mesh
                key={`${buildingIndex}-${partIndex}`}
                geometry={part.geometry}
                material={buildingData.buildingMaterials[part.materialIndex]}
                position={part.position}
                rotation={part.rotation}
              />
            ))}
          </group>
        ))}
      </group>
      
      {/* Sun/moon */}
      <mesh position={[size * 0.5, size * 0.3, -size * 0.5]}>
        <sphereGeometry args={[50, 32, 32]} />
        <meshBasicMaterial color="#A020F0" />
        <pointLight intensity={0.8} distance={size * 2} color="#A020F0" />
      </mesh>
      
      {/* Add dynamic lights */}
      <pointLight position={[0, 100, 0]} intensity={0.4} color="#00BFFF" distance={size} />
      <pointLight position={[-size * 0.3, 150, size * 0.3]} intensity={0.3} color="#A020F0" distance={size} />
      <pointLight position={[size * 0.3, 100, -size * 0.3]} intensity={0.3} color="#1E90FF" distance={size} />
      
      {/* Ambient fog */}
      <fog attach="fog" args={['#000033', 200, size * 0.8]} />
    </group>
  );
};

export default CyberBackground; 