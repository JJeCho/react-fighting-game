// components/HealthBar.js

import React from 'react';

function HealthBar({ id, health, player }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: player ? 'flex-end' : 'flex-start',
        borderTop: '4px solid white',
        borderLeft: player ? '4px solid white' : 'none',
        borderRight: player ? 'none' : '4px solid white',
        borderBottom: '4px solid white',
      }}
    >
      <div style={{ backgroundColor: 'red', height: '30px', width: '100%' }}></div>
      <div
        id={id}
        style={{
          position: 'absolute',
          background: '#818cf8',
          top: 0,
          right: player ? 0 : 'auto',
          left: player ? 'auto' : 0,
          bottom: 0,
          width: `${health}%`,
          transition: 'width 0.5s ease',
        }}
      ></div>
    </div>
  );
}

export default HealthBar;
