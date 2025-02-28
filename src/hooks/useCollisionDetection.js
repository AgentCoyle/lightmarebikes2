import { useCallback } from 'react';

// Helper function to check if a point is inside arena bounds
const isInsideArena = (position, arenaSize) => {
  const halfSize = arenaSize / 2;
  return (
    position[0] >= -halfSize &&
    position[0] <= halfSize &&
    position[1] >= -halfSize &&
    position[1] <= halfSize
  );
};

// Helper function to check if two line segments intersect
const doLinesIntersect = (line1Start, line1End, line2Start, line2End) => {
  // Calculate directions
  const dir1X = line1End[0] - line1Start[0];
  const dir1Z = line1End[1] - line1Start[1];
  const dir2X = line2End[0] - line2Start[0];
  const dir2Z = line2End[1] - line2Start[1];
  
  // Calculate determinant to check for parallel lines
  const det = dir1X * dir2Z - dir1Z * dir2X;
  
  // If determinant is zero, lines are parallel
  if (Math.abs(det) < 0.001) {
    return false;
  }
  
  // Calculate the parameters for intersection
  const dx = line2Start[0] - line1Start[0];
  const dz = line2Start[1] - line1Start[1];
  
  const t1 = (dx * dir2Z - dz * dir2X) / det;
  const t2 = (dx * dir1Z - dz * dir1X) / det;
  
  // Check if intersection point is within both line segments
  return t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1;
};

// Custom hook for collision detection
const useCollisionDetection = () => {
  // Check if a bike collides with any trail (including its own if specified)
  const checkBikeCollision = useCallback((bikePosition, bikeRotation, trails, arenaSize, bikeId = null, trailGap = 3) => {
    const halfArenaSize = arenaSize / 2;
    
    // Check arena boundary collision
    if (
      bikePosition[0] < -halfArenaSize ||
      bikePosition[0] > halfArenaSize ||
      bikePosition[1] < -halfArenaSize ||
      bikePosition[1] > halfArenaSize
    ) {
      return {
        collided: true,
        collidedWith: 'arena'
      };
    }
    
    // Check collision with all trails
    for (const trailId in trails) {
      // Skip own trail if bikeId is specified
      if (bikeId !== null && trailId === bikeId) {
        const ownTrail = trails[trailId];
        const points = ownTrail.points;
        
        // Skip collision check with recent points (gap)
        if (points.length <= trailGap) continue;
        
        // Check only against points before the gap
        for (let i = 0; i < points.length - trailGap - 1; i++) {
          const segmentStart = points[i];
          const segmentEnd = points[i + 1];
          
          // Create a line segment from the bike's current position to a small distance ahead
          const bikeDirection = [
            Math.sin(bikeRotation[1]),
            Math.cos(bikeRotation[1])
          ];
          
          const bikeSegmentEnd = [
            bikePosition[0] + bikeDirection[0] * 1.0, // 1.0 unit ahead
            bikePosition[1] + bikeDirection[1] * 1.0
          ];
          
          if (doLinesIntersect(
            [bikePosition[0], bikePosition[1]],
            bikeSegmentEnd,
            segmentStart,
            segmentEnd
          )) {
            return {
              collided: true,
              collidedWith: 'self'
            };
          }
        }
      } else {
        // Check collision with other trails
        const otherTrail = trails[trailId];
        const points = otherTrail.points;
        
        for (let i = 0; i < points.length - 1; i++) {
          const segmentStart = points[i];
          const segmentEnd = points[i + 1];
          
          // Create a line segment from the bike's current position to a small distance ahead
          const bikeDirection = [
            Math.sin(bikeRotation[1]),
            Math.cos(bikeRotation[1])
          ];
          
          const bikeSegmentEnd = [
            bikePosition[0] + bikeDirection[0] * 1.0, // 1.0 unit ahead
            bikePosition[1] + bikeDirection[1] * 1.0
          ];
          
          if (doLinesIntersect(
            [bikePosition[0], bikePosition[1]],
            bikeSegmentEnd,
            segmentStart,
            segmentEnd
          )) {
            return {
              collided: true,
              collidedWith: trailId
            };
          }
        }
      }
    }
    
    return {
      collided: false,
      collidedWith: null
    };
  }, []);
  
  return {
    checkBikeCollision,
    isInsideArena
  };
};

export default useCollisionDetection; 