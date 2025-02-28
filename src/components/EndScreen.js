import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;
const MotionButton = motion.button;

const EndScreen = ({ winner, onRestart }) => {
  const controls = useAnimation();
  
  useEffect(() => {
    controls.start({
      opacity: [0, 1],
      y: [20, 0],
      transition: { duration: 1 }
    });
  }, [controls]);

  // Add space key listener for restarting the game
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        if (typeof onRestart === 'function') {
          onRestart();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onRestart]);

  const isPlayerWinner = winner === 'player';
  
  return (
    <div 
      style={{
        width: "100%", 
        height: "100%", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        background: "black",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background effects */}
      <div
        style={{
          position: "absolute",
          width: "200%",
          height: "200%",
          top: "-50%",
          left: "-50%",
          backgroundImage: "linear-gradient(rgba(0, 200, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 200, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          transform: "perspective(500px) rotateX(60deg)",
          opacity: 0.4,
          zIndex: 0
        }}
      />
      
      {/* Animated particles */}
      {isPlayerWinner && Array.from({ length: 20 }).map((_, i) => (
        <MotionDiv
          key={i}
          style={{
            position: "absolute",
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            borderRadius: "50%",
            background: i % 2 === 0 ? "#9932CC" : "#00BFFF",
            boxShadow: i % 2 === 0 ? "0 0 8px #9932CC" : "0 0 8px #00BFFF",
            zIndex: 1
          }}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: window.innerHeight + 10 
          }}
          animate={{ 
            y: -10,
            x: `${Math.random() * 100 - 50}px`
          }}
          transition={{ 
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            ease: "linear", 
            delay: Math.random() * 2
          }}
        />
      ))}
      
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        maxWidth: "800px", 
        textAlign: "center",
        zIndex: 2
      }}>
        {isPlayerWinner ? (
          <>
            <MotionH1
              style={{
                fontSize: "3rem",
                color: "white",
                textShadow: "0 0 10px #A020F0, 0 0 20px #A020F0",
                letterSpacing: "2px",
                fontFamily: "monospace",
                margin: "0 0 1.5rem 0"
              }}
              animate={controls}
            >
              CONGRATULATIONS AGENT
            </MotionH1>
            
            <MotionP
              style={{
                fontSize: "2rem",
                color: "#BB86FC",
                textShadow: "0 0 5px #A020F0",
                fontFamily: "monospace",
                margin: "0 0 2rem 0"
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              YOU SHALL BECOME IMMORTAL
            </MotionP>
          </>
        ) : (
          <>
            <MotionH1
              style={{
                fontSize: "3rem",
                color: "#FF5252",
                textShadow: "0 0 10px #FF4500, 0 0 20px #FF4500",
                letterSpacing: "2px",
                fontFamily: "monospace",
                margin: "0 0 1.5rem 0"
              }}
              animate={controls}
            >
              GAME OVER
            </MotionH1>
            
            <MotionP
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontFamily: "monospace",
                margin: "0 0 2rem 0"
              }}
              animate={controls}
            >
              Your light trail has been severed. The Grid claims another program.
            </MotionP>
          </>
        )}
        
        <div style={{ height: "40px" }} />
        
        <MotionButton
          style={{
            background: "transparent",
            border: `2px solid ${isPlayerWinner ? "#A020F0" : "#FF4500"}`,
            color: isPlayerWinner ? "#A020F0" : "#FF4500",
            padding: "0.75rem 2.5rem",
            fontSize: "1rem",
            fontFamily: "monospace",
            cursor: "pointer",
            outline: "none",
            marginTop: "1.5rem"
          }}
          whileHover={{ 
            scale: 1.05,
            backgroundColor: isPlayerWinner ? "rgba(128, 0, 128, 0.2)" : "rgba(255, 0, 0, 0.2)",
            boxShadow: isPlayerWinner ? "0 0 15px #A020F0" : "0 0 15px #FF0000"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.preventDefault();
            if (typeof onRestart === 'function') {
              onRestart();
            }
          }}
        >
          REENTER THE GRID
        </MotionButton>
        
        {/* Add space key prompt */}
        <MotionP
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontFamily: "monospace",
            fontSize: "0.9rem",
            marginTop: "1rem",
            textShadow: isPlayerWinner ? "0 0 5px #A020F0" : "0 0 5px #FF4500"
          }}
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Press SPACE to reenter
        </MotionP>
      </div>
    </div>
  );
};

export default EndScreen; 