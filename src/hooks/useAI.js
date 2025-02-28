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
    deltaTime,
    difficulty = 5 // Default to medium difficulty if not provided
  ) => {
    // If AI has lost, don't move
    if (!isInsideArena(position, arenaSize)) {
      return {
        rotation,
        position,
        eliminated: true
      };
    }
    
    // Scale AI capabilities based on difficulty (1-10)
    // Higher difficulty means better lookahead, more options, and smarter decisions
    const difficultyFactor = difficulty / 5; // 1 = baseline (medium), 2 = maximum
    
    // Check for potential collisions in the current direction
    // Scale lookahead distance based on difficulty
    const baseCollisionCheckDistance = speed * 15;
    const collisionCheckDistance = baseCollisionCheckDistance * (0.7 + (difficultyFactor * 0.6)); 
    
    // Scale number of check points based on difficulty
    const baseCollisionCheckPoints = 6;
    const collisionCheckPoints = Math.floor(baseCollisionCheckPoints * (0.7 + (difficultyFactor * 0.6)));
    
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
    
    // AI behavior based on type and difficulty
    switch (behavior) {
      case 'aggressive': // Cyan - tries to cut off the player
        // Calculate angles: straight ahead, towards player, and some variations
        possibleDirections.push({
          angle: rotation[1], // Current direction
          weight: 1.0
        });
        
        // Towards player with slight offset - more aggressive at higher difficulties
        possibleDirections.push({
          angle: angleToPlayer,
          weight: 1.0 + (difficultyFactor * 0.5) // More weight at higher difficulties
        });
        
        // Add more aggressive options - try to intercept player
        possibleDirections.push({
          angle: angleToPlayer + Math.PI / (6 + (10 - difficulty)), // Tighter angles at higher difficulties
          weight: 0.8 + (difficultyFactor * 0.4)
        });
        
        possibleDirections.push({
          angle: angleToPlayer - Math.PI / (6 + (10 - difficulty)),
          weight: 0.8 + (difficultyFactor * 0.4)
        });
        
        // Add some random variations - fewer at higher difficulties
        const randomVariationWeight = Math.max(0.2, 0.8 - (difficultyFactor * 0.3));
        possibleDirections.push({
          angle: rotation[1] + Math.PI / 4,
          weight: randomVariationWeight
        });
        
        possibleDirections.push({
          angle: rotation[1] - Math.PI / 4,
          weight: randomVariationWeight
        });
        
        // Add more precise interception angles at higher difficulties
        if (difficulty > 6) {
          // Calculate interception point based on player direction and speed
          // This is a simplified prediction that gets more accurate at higher difficulties
          const predictionAccuracy = (difficulty - 6) / 4; // 0.25 to 1.0
          
          // Add precise interception angles
          possibleDirections.push({
            angle: angleToPlayer + Math.PI / 12 * predictionAccuracy,
            weight: 1.2 + predictionAccuracy
          });
          
          possibleDirections.push({
            angle: angleToPlayer - Math.PI / 12 * predictionAccuracy,
            weight: 1.2 + predictionAccuracy
          });
        }
        break;
        
      case 'defensive': // Pink - plays it safe, avoids collisions
        // More cautious - check more angles and favor those away from danger
        possibleDirections.push({
          angle: rotation[1], // Current direction
          weight: 1.0
        });
        
        // Add more defensive options - try to move away from trails
        // Higher difficulties have more precise angle calculations
        const defensiveAngleBase = Math.PI / (6 - (difficulty * 0.2));
        possibleDirections.push({
          angle: rotation[1] + defensiveAngleBase,
          weight: 0.8
        });
        
        possibleDirections.push({
          angle: rotation[1] - defensiveAngleBase,
          weight: 0.8
        });
        
        possibleDirections.push({
          angle: rotation[1] + defensiveAngleBase * 2,
          weight: 0.7
        });
        
        possibleDirections.push({
          angle: rotation[1] - defensiveAngleBase * 2,
          weight: 0.7
        });
        
        // Add some random variations for unpredictability
        // Higher difficulties have less randomness
        const defensiveRandomWeight = Math.max(0.2, 0.6 - (difficultyFactor * 0.2));
        possibleDirections.push({
          angle: rotation[1] + Math.PI / 2,
          weight: defensiveRandomWeight
        });
        
        possibleDirections.push({
          angle: rotation[1] - Math.PI / 2,
          weight: defensiveRandomWeight
        });
        
        // At higher difficulties, add more escape options
        if (difficulty > 5) {
          // Add more precise escape angles
          const escapeAngles = Math.floor(difficulty / 2); // 3-5 additional angles
          for (let i = 1; i <= escapeAngles; i++) {
            const angleOffset = (Math.PI / 8) * i;
            possibleDirections.push({
              angle: rotation[1] + angleOffset,
              weight: 0.9 - (i * 0.1)
            });
            
            possibleDirections.push({
              angle: rotation[1] - angleOffset,
              weight: 0.9 - (i * 0.1)
            });
          }
        }
        break;
        
      case 'random': // Yellow - makes unpredictable movements
        // Completely random - sometimes make dramatic turns
        possibleDirections.push({
          angle: rotation[1], // Current direction
          weight: 1.0
        });
        
        // Add a lot of random options with varying weights
        // Higher difficulties have more controlled randomness
        const randomOptions = 4 + Math.floor(difficulty / 2); // 5-9 options
        for (let i = 0; i < randomOptions; i++) {
          // At higher difficulties, randomness is more controlled
          const randomFactor = difficulty > 7 ? 0.7 : 1.0;
          const randomAngle = rotation[1] + (Math.random() * 2 - 1) * Math.PI / 2 * randomFactor;
          
          possibleDirections.push({
            angle: randomAngle,
            weight: 0.5 + Math.random() * 0.5
          });
        }
        
        // Occasionally, make drastic turns - less likely at higher difficulties
        const drasticTurnChance = difficulty > 7 ? 0.05 : 0.1;
        if (Math.random() < drasticTurnChance) {
          possibleDirections.push({
            angle: rotation[1] + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1),
            weight: 1.2
          });
        }
        
        // At higher difficulties, add some strategic options
        if (difficulty > 6) {
          // Sometimes try to move towards open spaces
          possibleDirections.push({
            angle: angleToPlayer + Math.PI, // Away from player
            weight: 0.7
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
        
        // Trail gap decreases with difficulty (harder to exploit gaps)
        const trailGap = Math.max(1, 4 - Math.floor(difficulty / 3));
        
        // Check if this position would cause a collision
        const collisionResult = checkBikeCollision(
          checkPosition,
          testRotation,
          trails,
          arenaSize,
          id,
          trailGap
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
        score += (1 - (angleToPlayerDiff / Math.PI)) * 10 * difficultyFactor; // More bonus at higher difficulties
      } else if (behavior === 'defensive') {
        // Reward directions that keep AI away from other trails
        score += longestSafeDistance * 0.5 * difficultyFactor;
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
    
    // Adjust speed based on behavior and difficulty
    let adjustedSpeed = speed;
    if (behavior === 'aggressive') {
      adjustedSpeed *= 1.0 + (0.1 * difficultyFactor); // Faster at higher difficulties
    } else if (behavior === 'defensive' && difficulty > 7) {
      // Defensive bikes get slightly faster at very high difficulties
      adjustedSpeed *= 1.0 + (0.05 * (difficulty - 7) / 3);
    }
    
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