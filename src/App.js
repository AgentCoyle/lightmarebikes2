import React, { useState } from 'react';
import './App.css';

// Game components (to be implemented)
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';

// Game states
const GAME_STATE = {
  START: 'start',
  PLAYING: 'playing',
  PAUSED: 'paused',
  END: 'end'
};

function App() {
  const [gameState, setGameState] = useState(GAME_STATE.START);
  const [winner, setWinner] = useState(null);

  const startGame = () => {
    setGameState(GAME_STATE.PLAYING);
  };

  const pauseGame = () => {
    setGameState(GAME_STATE.PAUSED);
  };

  const resumeGame = () => {
    setGameState(GAME_STATE.PLAYING);
  };

  const stopGame = () => {
    setGameState(GAME_STATE.START);
  };

  const endGame = (winner) => {
    setWinner(winner);
    setGameState(GAME_STATE.END);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "black" }}>
      {gameState === GAME_STATE.START && (
        <StartScreen onStart={startGame} />
      )}
      
      {(gameState === GAME_STATE.PLAYING || gameState === GAME_STATE.PAUSED) && (
        <GameScreen 
          isPlaying={gameState === GAME_STATE.PLAYING}
          onPause={pauseGame}
          onResume={resumeGame}
          onStop={stopGame}
          onEnd={endGame}
        />
      )}
      
      {gameState === GAME_STATE.END && (
        <EndScreen 
          winner={winner} 
          onRestart={startGame}
        />
      )}
    </div>
  );
}

export default App;
