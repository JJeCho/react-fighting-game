// src/components/CharacterSelection.js

import React from 'react';
import { characters } from '../utils/characterConfig';

function CharacterSelection({ onSelectCharacter }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
        color: 'white',
        height: '100vh',
      }}
    >
      <h1>Select Your Character</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        {Object.keys(characters).map((key) => (
          <div
            key={key}
            style={{
              cursor: 'pointer',
              padding: '10px',
              border: '1px solid white',
              textAlign: 'center',
            }}
            onClick={() => onSelectCharacter(key)}
          >
            <h3>{characters[key].name}</h3>
            <img
              src={characters[key].sprites.idle.imageSrc}
              alt={characters[key].name}
              width="100"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CharacterSelection;
