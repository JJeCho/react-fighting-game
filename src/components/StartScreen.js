// components/StartScreen.js

import React from 'react';

function StartScreen({ onStart }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'black',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        zIndex: 10,
      }}
    >
      <h1>Welcome to the Game</h1>
      <button onClick={onStart}>Start Game</button>
    </div>
  );
}

export default StartScreen;
