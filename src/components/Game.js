// components/Game.js

import React, { useEffect, useRef, useState } from 'react';

import HealthBar from './HealthBar';
import Timer from './Timer';
import StartScreen from './StartScreen';
import GameOverScreen from './GameOverScreen';
import CharacterSelection from './CharacterSelection';


import Sprite from '../classes/Sprite';
import Fighter from '../classes/Fighter';

import { determineWinner } from '../utils/determineWinner';
import { GRAVITY } from '../utils/constants';
import { characters } from '../utils/characterConfig'; 

import backgroundImageSrc from '../assets/background.png';
import shopImageSrc from '../assets/shop.png';


function Game() {
  const [timer, setTimer] = useState(60);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [displayText, setDisplayText] = useState('');
  const [gameState, setGameState] = useState('start');
  const [isPaused, setIsPaused] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const enemyRef = useRef(null);
  const backgroundRef = useRef(null);
  const shopRef = useRef(null);
  const keysRef = useRef({
    a: { pressed: false },
    d: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
  });

  let animationId;

  useEffect(() => {
    if (gameState === 'playing') {
      initializeGame();
      animate();
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        cancelAnimationFrame(animationId);
      };
    }
  }, [gameState]);

  useEffect(() => {
    let timerId;
    if (gameState === 'playing' && !isPaused && timer > 0) {
      timerId = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0) {
      determineWinner({
        player: playerRef.current,
        enemy: enemyRef.current,
        setDisplayText,
        setGameState,
      });
    }
    return () => clearTimeout(timerId);
  }, [timer, gameState, isPaused]);

  function initializeGame() {
    const canvas = canvasRef.current;
    const c = canvas.getContext('2d');
  
    canvas.width = 1024;
    canvas.height = 576;
  
    c.fillRect(0, 0, canvas.width, canvas.height);
  
    const background = new Sprite({
      position: { x: 0, y: 0 },
      imageSrc: backgroundImageSrc,
      context: c,
    });
  
    const shop = new Sprite({
      position: { x: 600, y: 128 },
      imageSrc: shopImageSrc,
      scale: 2.75,
      framesMax: 6,
      context: c,
    });
    const characterConfig = characters[selectedCharacter];
    const enemyConfig = characters.kenji;

    const player = new Fighter({
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      offset: characterConfig.offset,
      imageSrc: characterConfig.sprites.idle.imageSrc,
      framesMax: characterConfig.sprites.idle.framesMax,
      scale: characterConfig.scale,
      sprites: characterConfig.sprites,
      attackBox: characterConfig.attackBox,
      context: c,
      gravity: GRAVITY,
      playerRef,
      enemyRef,
    });
  
    const enemy = new Fighter({
      position: { x: 400, y: 100 },
      velocity: { x: 0, y: 0 },
      color: 'blue',
      offset: enemyConfig.offset,
      imageSrc: enemyConfig.sprites.idle.imageSrc,
      framesMax: enemyConfig.sprites.idle.framesMax,
      scale: enemyConfig.scale,
      sprites: enemyConfig.sprites,
      attackBox: enemyConfig.attackBox,
      context: c,
      gravity: GRAVITY,
      playerRef,
      enemyRef,
    });
  
    playerRef.current = player;
    enemyRef.current = enemy;
    backgroundRef.current = background;
    shopRef.current = shop;
  }
  
  function resetGame() {
    setTimer(60);
    setPlayerHealth(100);
    setEnemyHealth(100);
    setDisplayText('');
    initializeGame();
    setGameState('playing');
  }

  function animate() {
    if (isPaused || gameState !== 'playing') return;
    animationId = requestAnimationFrame(animate);
    const c = canvasRef.current.getContext('2d');
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    backgroundRef.current.update();
    shopRef.current.update();

    c.fillStyle = 'rgba(255, 255, 255, 0.15)';
    c.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    playerRef.current.update(keysRef.current);
    enemyRef.current.update(keysRef.current);

    if (playerHealth !== playerRef.current.health) {
      setPlayerHealth(playerRef.current.health);
    }
    if (enemyHealth !== enemyRef.current.health) {
      setEnemyHealth(enemyRef.current.health);
    }

    if (playerRef.current.health <= 0 || enemyRef.current.health <= 0) {
      determineWinner({
        player: playerRef.current,
        enemy: enemyRef.current,
        setDisplayText,
        setGameState,
      });
    }
  }

  function handleKeyDown(event) {
    const keys = keysRef.current;
    const player = playerRef.current;
    const enemy = enemyRef.current;

    if (!player.dead) {
      switch (event.key) {
        case 'd':
          keys.d.pressed = true;
          player.lastKey = 'd';
          break;
        case 'a':
          keys.a.pressed = true;
          player.lastKey = 'a';
          break;
        case 'w':
          if (player.velocity.y === 0) player.velocity.y = -20;
          break;
        case ' ':
          player.attack();
          break;
        default:
          break;
      }
    }

    if (!enemy.dead) {
      switch (event.key) {
        case 'ArrowRight':
          keys.ArrowRight.pressed = true;
          enemy.lastKey = 'ArrowRight';
          break;
        case 'ArrowLeft':
          keys.ArrowLeft.pressed = true;
          enemy.lastKey = 'ArrowLeft';
          break;
        case 'ArrowUp':
          if (enemy.velocity.y === 0) enemy.velocity.y = -20;
          break;
        case 'ArrowDown':
          enemy.attack();
          break;
        default:
          break;
      }
    }

    if (event.key === 'Escape') {
      setIsPaused((prev) => !prev);
    }
  }

  function handleKeyUp(event) {
    const keys = keysRef.current;
    switch (event.key) {
      case 'd':
        keys.d.pressed = false;
        break;
      case 'a':
        keys.a.pressed = false;
        break;
      case 'ArrowRight':
        keys.ArrowRight.pressed = false;
        break;
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = false;
        break;
      default:
        break;
    }
  }

  if (!selectedCharacter) {
    return <CharacterSelection onSelectCharacter={setSelectedCharacter} />;
  }


  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Start Screen */}
      {gameState === 'start' && <StartScreen onStart={() => setGameState('playing')} />}

      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <GameOverScreen displayText={displayText} onRestart={resetGame} />
      )}

      {/* Game UI */}
      {gameState === 'playing' && (
        <>
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              padding: '20px',
            }}
          >
            {/* Player Health */}
            <HealthBar id="playerHealth" health={playerHealth} player={true} />

            {/* Timer */}
            <Timer timer={timer} />

            {/* Enemy Health */}
            <HealthBar id="enemyHealth" health={enemyHealth} player={false} />
          </div>

          {/* Pause Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 5,
            }}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          {/* Display Text */}
          <div
            id="displayText"
            style={{
              position: 'absolute',
              color: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              display: displayText ? 'flex' : 'none',
            }}
          >
            {displayText}
          </div>
        </>
      )}

      {/* Canvas */}
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default Game;
