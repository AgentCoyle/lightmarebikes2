import { useCallback } from 'react';
import useCollisionDetection from './useCollisionDetection';

const useAI = () => {
  const { checkBikeCollision, isInsideArena } = useCollisionDetection();
  
  // Determine AI movement based on behavior type, position, surroundings, etc.
  const determineAIMovement = useCallback((
    id,
    behavior,
    position,
    rotation,
    speed,
    trails,
    playerPosition,
    arenaSize,
    deltaTime
  ) => {
    // If AI has lost, don't move
    if (!isInsideArena(position, arenaSize)) {
      return {
        rotation,
        position,
        eliminated: true
      };
    }
    
    // Check for potential collisions in the current direction
    const collisionCheckDistance = speed * 20; // Look further ahead for planning
    const collisionCheckPoints = 8; // Number of points to check
    
    // Store all possible directions to try
    const possibleDirections = [];
    
    // Get direction vector to the player (for chasing or avoiding)
    const toPlayerVector = [
      playerPosition[0] - position[0],
      playerPosition[1] - position[1]
    ];
    const distanceToPlayer = Math.sqrt(toPlayerVector[0] * toPlayerVector[0] + toPlayerVector[1] * toPlayerVector[1]);
    
    // Normalize the player direction vector
    const normalizedToPlayerVector = distanceToPlayer > 0 ? 
      [toPlayerVector[0] / distanceToPlayer, toPlayerVector[1] / distanceToPlayer] : 
      [0, 0];
    
    // Get angle to player
    const angleToPlayer = Math.atan2(normalizedToPlayerVector[0], normalizedToPlayerVector[1]);
    
    // AI behavior based on type
    switch (behavior) {
      case 'aggressive': // Cyan - tries to cut off the player
        // Calculate angles: straight ahead, towards player, and some variations
        possibleDirections.push({
          angle: rotation[1], // Current direction
          weight: 1.0
        });
        
        // Towards player with slight offset
        possibleDirections.push({
          angle: angleToPlayer,
          weight: 1.5 
        });
        
        // Add more aggressive options - try to intercept player
        possibleDirections.push({
          angle: angleToPlayer + Math.PI / 6,
          weight: 1.2
        });
        
        possibleDirections.push({
          angle: angleToPlayer - Math.PI / 6,
          weight: 1.2
        });
        
        // Add some random variations
        possibleDirections.push({
          angle: rotation[1] + Math.PI / 4,
          weight: 0.7
        });
        
        possibleDirections.push({
          angle: rotation[1] - Math.PI / 4,
          weight: 0.7
        });
        break;
        
      case 'defensive': // Pink - plays it safe, avoids collisions
        // More cautious - check more angles and favor those away from danger
        possibleDirections.push({
          angle: rotation[1], // Current direction
          weight: 1.0
        });
        
        // Add more defensive options - try to move away from trails
        possibleDirections.push({
          angle: rotation[1] + Math.PI / 6,
          weight: 0.8
        });
        
        possibleDirections.push({
          angle: rotation[1] - Math.PI / 6,
          weight: 0.8
        });
        
        possibleDirections.push({
          angle: rotation[1] + Math.PI / 3,
          weight: 0.7
        });
        
        possibleDirections.push({
          angle: rotation[1] - Math.PI / 3,
          weight: 0.7
        });
        
        // Add some random variations for unpredictability
        possibleDirections.push({
          angle: rotation[1] + Math.PI / 2,
          weight: 0.6
        });
        
        possibleDirections.push({
          angle: rotation[1] - Math.PI / 2,
          weight: 0.6
        });
        break;
        
      case 'random': // Yellow - makes unpredictable movements
        // Completely random - sometimes make dramatic turns
        possibleDirections.push({
          angle: rotation[1], // Current direction
          weight: 1.0
        });
        
        // Add a lot of random options with varying weights
        for (let i = 0; i < 6; i++) {
          const randomAngle = rotation[1] + (Math.random() * 2 - 1) * Math.PI / 2;
          possibleDirections.push({
            angle: randomAngle,
            weight: 0.5 + Math.random() * 0.5
          });
        }
        
        // Occasionally, make drastic turns
        if (Math.random() < 0.1) {
          possibleDirections.push({
            angle: rotation[1] + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1),
            weight: 1.2
          });
        }
        break;
        
      default:
        // Default behavior - basic pathfinding
        possibleDirections.push({
          angle: rotation[1], // Current direction
          weight: 1.0
        });
        
        possibleDirections.push({
          angle: rotation[1] + Math.PI / 4,
          weight: 0.7
        });
        
        possibleDirections.push({
          angle: rotation[1] - Math.PI / 4,
          weight: 0.7
        });
    }
    
    // Evaluate each direction for safety and strategic value
    let bestDirection = null;
    let bestScore = -Infinity;
    
    for (const dirOption of possibleDirections) {
      const angle = dirOption.angle;
      const weight = dirOption.weight;
      
      // Create a temporary direction vector
      const testDirection = [
        Math.sin(angle),
        Math.cos(angle)
      ];
      
      // Check multiple points along this direction
      let isSafe = true;
      let longestSafeDistance = 0;
      
      for (let i = 1; i <= collisionCheckPoints; i++) {
        const checkDistance = (i / collisionCheckPoints) * collisionCheckDistance;
        const checkPosition = [
          position[0] + testDirection[0] * checkDistance,
          position[1] + testDirection[1] * checkDistance
        ];
        
        // Create a temporary rotation array for collision check
        const testRotation = [0, angle, 0];
        
        // Check if this position would cause a collision
        const collisionResult = checkBikeCollision(
          checkPosition,
          testRotation,
          trails,
          arenaSize,
          id,
          3 // Trail gap
        );
        
        if (collisionResult.collided) {
          isSafe = false;
          longestSafeDistance = checkDistance;
          break;
        }
        
        longestSafeDistance = checkDistance;
      }
      
      // Calculate score based on safety and weighted strategy
      let score = 0;
      
      if (isSafe) {
        score = collisionCheckDistance * weight;
      } else {
        score = longestSafeDistance * weight * 0.8; // Penalize but still consider
      }
      
      // Add strategy-specific scoring
      if (behavior === 'aggressive') {
        // Reward directions that bring AI closer to player
        const angleToPlayerDiff = Math.abs(normalizeAngle(angle - angleToPlayer));
        score += (1 - (angleToPlayerDiff / Math.PI)) * 10; // Up to 10 bonus points for heading towards player
      } else if (behavior === 'defensive') {
        // Reward directions that keep AI away from other trails
        score += longestSafeDistance * 0.5;
      }
      
      // Update best direction if this one is better
      if (score > bestScore) {
        bestScore = score;
        bestDirection = angle;
      }
    }
    
    // If no safe direction is found, just try to minimize damage by making a sharp turn
    if (bestDirection === null) {
      bestDirection = rotation[1] + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
    }
    
    // Update rotation based on the best direction
    const newRotation = [0, bestDirection, 0];
    
    // Calculate new position
    const moveDirection = [
      Math.sin(bestDirection),
      Math.cos(bestDirection)
    ];
    
    const adjustedSpeed = behavior === 'aggressive' ? speed * 1.1 : speed;
    
    const newPosition = [
      position[0] + moveDirection[0] * adjustedSpeed * deltaTime,
      position[1] + moveDirection[1] * adjustedSpeed * deltaTime
    ];
    
    // Check if the AI is eliminated
    const finalCollisionCheck = checkBikeCollision(
      newPosition,
      newRotation,
      trails,
      arenaSize,
      id
    );
    
    return {
      rotation: newRotation,
      position: [newPosition[0], position[1], newPosition[1]],
      eliminated: finalCollisionCheck.collided
    };
  }, [checkBikeCollision, isInsideArena]);
  
  // Helper function to normalize an angle
  const normalizeAngle = (angle) => {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  };
  
  return {
    determineAIMovement
  };
};

export default useAI; 