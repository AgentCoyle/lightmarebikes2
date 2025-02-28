import React from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionButton = motion.button;

const StartScreen = ({ onStart }) => {
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
      {/* Grid background */}
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
      
      {/* Energy beam effects */}
      <MotionDiv
        style={{
          position: "absolute",
          width: "100%",
          height: "5px",
          background: "#00BFFF",
          boxShadow: "0 0 20px #00BFFF, 0 0 40px #00BFFF",
          zIndex: 1
        }}
        animate={{
          y: ["30vh", "-30vh"],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <MotionDiv
        style={{
          position: "absolute",
          width: "5px",
          height: "100%",
          background: "#9932CC",
          left: "30%",
          boxShadow: "0 0 20px #9932CC, 0 0 40px #9932CC",
          zIndex: 1
        }}
        animate={{
          x: ["-30vw", "70vw"],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          delay: 1
        }}
      />
      
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        gap: "2rem",
        zIndex: 2 
      }}>
        <MotionH1
          style={{
            fontSize: "4rem",
            color: "white",
            textShadow: "0 0 10px #00BFFF, 0 0 20px #00BFFF",
            letterSpacing: "4px",
            fontFamily: "monospace",
            margin: 0
          }}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          LIGHTMAREBIKES
        </MotionH1>
        
        <p
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontFamily: "monospace",
            textAlign: "center",
            maxWidth: "600px",
            marginBottom: "1.5rem"
          }}
        >
          Enter the grid. Race your light bike against 3 AI opponents. Leave no escape routes.
          Be the last one standing to achieve immortality.
        </p>
        
        <MotionButton
          style={{
            background: "transparent",
            border: "2px solid #00BFFF",
            color: "#00BFFF",
            padding: "0.75rem 2.5rem",
            fontSize: "1rem",
            fontFamily: "monospace",
            cursor: "pointer",
            outline: "none"
          }}
          whileHover={{ 
            scale: 1.05,
            backgroundColor: "rgba(0, 191, 255, 0.2)",
            boxShadow: "0 0 15px #00BFFF"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
        >
          ENTER THE GRID
        </MotionButton>
      </div>
    </div>
  );
};

export default StartScreen; 