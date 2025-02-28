import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { FaPause, FaPlay, FaStop } from 'react-icons/fa';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import { Bloom, EffectComposer, ChromaticAberration } from '@react-three/postprocessing';

// Game components
import Arena from './Arena';
import LightBike from './LightBike';
import LightTrail from './LightTrail';

// Custom hooks
import useKeyboardControls from '../hooks/useKeyboardControls';
import useCollisionDetection from '../hooks/useCollisionDetection';
import useAI from '../hooks/useAI';

// Constants
const ARENA_SIZE = 300;
const BASE_SPEED = 45;
const BOOST_MULTIPLIER = 1.5;
const TURN_SPEED = 2.5;
const TRAIL_UPDATE_INTERVAL = 0.1; // seconds
const TRAIL_HEIGHT = 8;

// Bike colors
const BIKE_COLORS = {
  player: '#9932CC', // Purple
  ai1: '#00BFFF',    // Cyan
  ai2: '#FF69B4',    // Pink
  ai3: '#FFFF00'     // Yellow
};

// Main game component
const GameScreen = ({ isPlaying, onPause, onResume, onStop, onEnd }) => {
  // Add state to track player elimination
  const [playerEliminated, setPlayerEliminated] = useState(false);
  
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas shadows>
        <GameContent 
          isPlaying={isPlaying} 
          onPause={onPause} 
          onResume={onResume} 
          onStop={onStop} 
          onEnd={onEnd}
          onPlayerEliminated={() => setPlayerEliminated(true)}
        />
        
        {/* Post-processing effects for that cyberpunk look */}
        <EffectComposer>
          <Bloom 
            intensity={1.5} 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.9} 
          />
          <ChromaticAberration 
            offset={[0.0005, 0.0005]} 
            opacity={0.6}
          />
        </EffectComposer>
      </Canvas>
      
      {/* Game controls overlay */}
      <div 
        style={{
          position: "absolute", 
          bottom: "20px", 
          left: "0", 
          right: "0", 
          display: "flex", 
          justifyContent: "center",
          pointerEvents: "none"
        }}
      >
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          background: "rgba(0, 0, 0, 0.5)", 
          borderRadius: "9999px", 
          padding: "0.5rem",
          pointerEvents: "auto" 
        }}>
          {isPlaying ? (
            <button
              onClick={onPause}
              style={{
                backgroundColor: "#00BFFF",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <FaPause />
            </button>
          ) : (
            <button
              onClick={onResume}
              style={{
                backgroundColor: "#38A169",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              }}
            >
              <FaPlay />
            </button>
          )}
          
          <button
            onClick={onStop}
            style={{
              backgroundColor: "#E53E3E",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            <FaStop />
          </button>
        </div>
      </div>
      
      {/* Instructions */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "4px",
          pointerEvents: "none"
        }}
      >
        <p style={{ color: "white", fontSize: "18px", fontWeight: "bold", textShadow: "0 0 5px black", margin: 0 }}>
          Controls:
        </p>
        <p style={{ color: "white", fontSize: "14px", textShadow: "0 0 5px black", margin: 0 }}>
          W - Boost speed
        </p>
        <p style={{ color: "white", fontSize: "14px", textShadow: "0 0 5px black", margin: 0 }}>
          A/D - Turn left/right
        </p>
        <p style={{ color: "white", fontSize: "14px", textShadow: "0 0 5px black", margin: 0 }}>
          S - Slow down
        </p>
        <p style={{ color: "white", fontSize: "14px", textShadow: "0 0 5px black", margin: 0 }}>
          Space - Pause
        </p>
      </div>
      
      {/* Death overlay - outside Canvas for proper display */}
      {playerEliminated && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(255, 0, 0, 0.3)",
            pointerEvents: "none",
            zIndex: 10
          }}
        >
          <motion.p
            style={{
              color: "white",
              fontSize: "4rem",
              fontWeight: "bold",
              textShadow: "0 0 10px #FF0000, 0 0 20px #FF0000"
            }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ELIMINATED
          </motion.p>
        </div>
      )}
      
      {/* Pause overlay */}
      {!isPlaying && (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(0, 0, 0, 0.5)",
            pointerEvents: "none"
          }}
        >
          <motion.p
            style={{
              color: "white",
              fontSize: "4rem",
              fontWeight: "bold",
              textShadow: "0 0 10px #00BFFF, 0 0 20px #00BFFF"
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            PAUSED
          </motion.p>
        </div>
      )}
    </div>
  );
};

// Actual game content with 3D elements and logic
const GameContent = ({ isPlaying, onPause, onResume, onStop, onEnd, onPlayerEliminated }) => {
  // References and state
  const timeRef = useRef({ lastTime: 0, deltaTime: 0, trailTimer: 0 });
  const playerRef = useRef(null);
  
  // Game state
  const [playerBike, setPlayerBike] = useState({
    position: [0, 0, -90],
    rotation: [0, 0, 0],
    speed: BASE_SPEED,
    eliminated: false
  });
  
  const [aiBikes, setAiBikes] = useState({
    ai1: {
      position: [-90, 0, 0],
      rotation: [0, Math.PI / 2, 0],
      behavior: 'aggressive',
      speed: BASE_SPEED * 0.95,
      eliminated: false
    },
    ai2: {
      position: [90, 0, 0],
      rotation: [0, -Math.PI / 2, 0],
      behavior: 'defensive',
      speed: BASE_SPEED * 0.9,
      eliminated: false
    },
    ai3: {
      position: [0, 0, 90],
      rotation: [0, Math.PI, 0],
      behavior: 'random',
      speed: BASE_SPEED * 1.05,
      eliminated: false
    }
  });
  
  // Trail state
  const [trails, setTrails] = useState({
    player: {
      points: [],
      color: BIKE_COLORS.player
    },
    ai1: {
      points: [],
      color: BIKE_COLORS.ai1
    },
    ai2: {
      points: [],
      color: BIKE_COLORS.ai2
    },
    ai3: {
      points: [],
      color: BIKE_COLORS.ai3
    }
  });
  
  // Active players count
  const [activePlayers, setActivePlayers] = useState(4);
  
  // Custom hooks
  const keys = useKeyboardControls(isPlaying);
  const { checkBikeCollision } = useCollisionDetection();
  const { determineAIMovement } = useAI();
  
  // Handle keyboard-triggered pause
  useEffect(() => {
    if (keys.space) {
      if (isPlaying) {
        onPause();
      } else {
        onResume();
      }
    }
  }, [keys.space, isPlaying, onPause, onResume]);
  
  // Update player bike based on controls
  useFrame((state) => {
    if (!isPlaying || playerBike.eliminated) return;
    
    // Calculate delta time for consistent movement regardless of frame rate
    const time = state.clock.getElapsedTime();
    timeRef.current.deltaTime = time - timeRef.current.lastTime;
    timeRef.current.lastTime = time;
    
    // Update trail timer
    timeRef.current.trailTimer += timeRef.current.deltaTime;
    
    // Handle player movement
    if (!playerBike.eliminated) {
      // Calculate rotation change based on key input
      let rotationY = playerBike.rotation[1];
      
      if (keys.left) {
        rotationY += TURN_SPEED * timeRef.current.deltaTime;
      }
      if (keys.right) {
        rotationY -= TURN_SPEED * timeRef.current.deltaTime;
      }
      
      // Calculate speed based on key input
      let speed = BASE_SPEED;
      if (keys.boost) {
        speed *= BOOST_MULTIPLIER;
      }
      if (keys.backward) {
        speed *= 0.5; // Slow down when S key is pressed
      }
      
      // Calculate new position
      const direction = [
        Math.sin(rotationY),
        Math.cos(rotationY)
      ];
      
      const newPosition = [
        playerBike.position[0] + direction[0] * speed * timeRef.current.deltaTime,
        playerBike.position[1],
        playerBike.position[2] + direction[1] * speed * timeRef.current.deltaTime
      ];
      
      // Check for collisions
      const collisionCheck = checkBikeCollision(
        [newPosition[0], newPosition[2]],
        [0, rotationY, 0],
        trails,
        ARENA_SIZE,
        'player'
      );
      
      if (collisionCheck.collided) {
        setPlayerBike(prev => ({
          ...prev,
          eliminated: true
        }));
        
        setActivePlayers(prev => prev - 1);
        
        // Notify parent component about player elimination
        onPlayerEliminated();
        
        // Check if game should end
        if (activePlayers === 1) {
          handleGameEnd();
        }
      } else {
        // Update player position and rotation
        setPlayerBike(prev => ({
          ...prev,
          position: newPosition,
          rotation: [0, rotationY, 0],
          speed
        }));
      }
    }
    
    // Update AI bikes
    if (timeRef.current.deltaTime > 0) {
      setAiBikes(prev => {
        const updated = { ...prev };
        let eliminationOccurred = false;
        
        Object.keys(updated).forEach(aiId => {
          const ai = updated[aiId];
          
          if (!ai.eliminated) {
            // Determine AI movement
            const aiMovement = determineAIMovement(
              aiId,
              ai.behavior,
              [ai.position[0], ai.position[2]],
              ai.rotation,
              ai.speed,
              trails,
              [playerBike.position[0], playerBike.position[2]],
              ARENA_SIZE,
              timeRef.current.deltaTime
            );
            
            // Update AI state
            updated[aiId] = {
              ...ai,
              position: [aiMovement.position[0], ai.position[1], aiMovement.position[2]],
              rotation: aiMovement.rotation,
              eliminated: aiMovement.eliminated
            };
            
            if (aiMovement.eliminated && !ai.eliminated) {
              eliminationOccurred = true;
            }
          }
        });
        
        // If any AI was eliminated this frame, update active players
        if (eliminationOccurred) {
          setActivePlayers(prev => {
            const newCount = Object.values(updated).filter(ai => !ai.eliminated).length + (playerBike.eliminated ? 0 : 1);
            
            // Check if game should end
            if (newCount <= 1) {
              handleGameEnd();
            }
            
            return newCount;
          });
        }
        
        return updated;
      });
    }
    
    // Update trails at intervals
    if (timeRef.current.trailTimer >= TRAIL_UPDATE_INTERVAL) {
      timeRef.current.trailTimer = 0;
      
      setTrails(prev => {
        const updated = { ...prev };
        
        // Update player trail if not eliminated
        if (!playerBike.eliminated) {
          updated.player.points = [
            ...updated.player.points,
            [playerBike.position[0], playerBike.position[2]]
          ];
        }
        
        // Update AI trails
        Object.keys(aiBikes).forEach(aiId => {
          const ai = aiBikes[aiId];
          if (!ai.eliminated) {
            updated[aiId].points = [
              ...updated[aiId].points,
              [ai.position[0], ai.position[2]]
            ];
          }
        });
        
        return updated;
      });
    }
  });
  
  // Handle game end
  const handleGameEnd = () => {
    // Determine the winner
    const playerWon = !playerBike.eliminated;
    setTimeout(() => {
      onEnd(playerWon ? 'player' : 'ai');
    }, 1500); // Small delay for dramatic effect
  };
  
  // Set up camera
  const Camera = () => {
    const { camera } = useThree();
    
    useFrame(() => {
      if (playerBike.eliminated) return;
      
      // Calculate camera position based on player bike
      const cameraHeight = 120;
      const cameraDistance = 90;
      
      // Position camera behind and above player
      const directionVector = [
        -Math.sin(playerBike.rotation[1]),
        -Math.cos(playerBike.rotation[1])
      ];
      
      camera.position.set(
        playerBike.position[0] + directionVector[0] * cameraDistance,
        cameraHeight,
        playerBike.position[2] + directionVector[1] * cameraDistance
      );
      
      // Look at a point ahead of the player
      const lookAheadAmount = 45;
      const targetPosition = [
        playerBike.position[0] + Math.sin(playerBike.rotation[1]) * lookAheadAmount,
        0,
        playerBike.position[2] + Math.cos(playerBike.rotation[1]) * lookAheadAmount
      ];
      
      camera.lookAt(targetPosition[0], targetPosition[1], targetPosition[2]);
    });
    
    return null;
  };
  
  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 120, 120]} fov={60} />
      <Camera />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[30, 60, 30]}
        intensity={1.0}
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
      />
      <pointLight position={[0, 45, 0]} intensity={0.7} color="#5588ff" />
      
      {/* Environment */}
      <Environment preset="night" />
      
      {/* Game arena */}
      <Arena size={ARENA_SIZE} wallHeight={TRAIL_HEIGHT + 2} />
      
      {/* Player bike */}
      <LightBike 
        ref={playerRef}
        position={playerBike.position} 
        rotation={playerBike.rotation} 
        color={BIKE_COLORS.player}
        isPlayer={true}
        isActive={!playerBike.eliminated}
        name="PLAYER"
      />
      
      {/* AI bikes */}
      {Object.entries(aiBikes).map(([aiId, ai]) => (
        <LightBike 
          key={aiId}
          position={ai.position} 
          rotation={ai.rotation}
          color={BIKE_COLORS[aiId]} 
          isPlayer={false}
          isActive={!ai.eliminated}
          name={aiId.toUpperCase()}
        />
      ))}
      
      {/* Light trails */}
      {Object.entries(trails).map(([id, trail]) => (
        trail.points.length > 1 && (
          <LightTrail 
            key={id}
            points={trail.points}
            color={trail.color}
            height={TRAIL_HEIGHT}
          />
        )
      ))}
    </>
  );
};

export default GameScreen; 