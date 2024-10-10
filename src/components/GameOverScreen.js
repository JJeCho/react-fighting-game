// components/GameOverScreen.js

import React from 'react';

function GameOverScreen({ displayText, onRestart }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        zIndex: 10,
      }}
    >
      <h1>{displayText}</h1>
      <button onClick={onRestart}>Restart Game</button>
    </div>
  );
}

export default GameOverScreen;
