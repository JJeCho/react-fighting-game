// components/Timer.js

import React from 'react';

function Timer({ timer }) {
  return (
    <div
      id="timer"
      style={{
        backgroundColor: 'black',
        width: '100px',
        height: '50px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        border: '4px solid white',
      }}
    >
      {timer}
    </div>
  );
}

export default Timer;
