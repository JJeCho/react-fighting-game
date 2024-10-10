import gsap from 'gsap';
import React, { useEffect, useRef, useState } from 'react';

// Import images
import backgroundImageSrc from './img/background.png';
import shopImageSrc from './img/shop.png';

// Player sprites
import samuraiMackAttack1Src from './img/samuraiMack/Attack1.png';
import samuraiMackDeathSrc from './img/samuraiMack/Death.png';
import samuraiMackFallSrc from './img/samuraiMack/Fall.png';
import samuraiMackIdleSrc from './img/samuraiMack/Idle.png';
import samuraiMackJumpSrc from './img/samuraiMack/Jump.png';
import samuraiMackRunSrc from './img/samuraiMack/Run.png';
import samuraiMackTakeHitSrc from './img/samuraiMack/Take Hit - white silhouette.png';

// Enemy sprites
import kenjiAttack1Src from './img/kenji/Attack1.png';
import kenjiDeathSrc from './img/kenji/Death.png';
import kenjiFallSrc from './img/kenji/Fall.png';
import kenjiIdleSrc from './img/kenji/Idle.png';
import kenjiJumpSrc from './img/kenji/Jump.png';
import kenjiRunSrc from './img/kenji/Run.png';
import kenjiTakeHitSrc from './img/kenji/Take hit.png';

function Game() {
  // State variables
  const [timer, setTimer] = useState(60);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [displayText, setDisplayText] = useState('');
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'gameOver'
  const [isPaused, setIsPaused] = useState(false);

  // Refs
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

  // Initialize game when gameState changes to 'playing'
  useEffect(() => {
    if (gameState === 'playing') {
      initializeGame();
      // Start animation
      animate();
      // Handle key events
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      // Clean up on unmount or when gameState changes
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        cancelAnimationFrame(animationId);
      };
    }
  }, [gameState]);

  // Timer effect
  useEffect(() => {
    let timerId;
    if (gameState === 'playing' && !isPaused && timer > 0) {
      timerId = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0) {
      determineWinner({ player: playerRef.current, enemy: enemyRef.current });
    }
    return () => clearTimeout(timerId);
  }, [timer, gameState, isPaused]);
  

  // Game initialization function
  function initializeGame() {
    // Initialize canvas and context
    const canvas = canvasRef.current;
    const c = canvas.getContext('2d');

    canvas.width = 1024;
    canvas.height = 576;

    c.fillRect(0, 0, canvas.width, canvas.height);

    const gravity = 0.7;

    // Initialize background and shop sprites
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

    // Initialize player and enemy fighters
    const player = new Fighter({
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
      imageSrc: samuraiMackIdleSrc,
      framesMax: 8,
      scale: 2.5,
      offset: { x: 215, y: 157 },
      sprites: {
        idle: { imageSrc: samuraiMackIdleSrc, framesMax: 8 },
        run: { imageSrc: samuraiMackRunSrc, framesMax: 8 },
        jump: { imageSrc: samuraiMackJumpSrc, framesMax: 2 },
        fall: { imageSrc: samuraiMackFallSrc, framesMax: 2 },
        attack1: { imageSrc: samuraiMackAttack1Src, framesMax: 6 },
        takeHit: { imageSrc: samuraiMackTakeHitSrc, framesMax: 4 },
        death: { imageSrc: samuraiMackDeathSrc, framesMax: 6 },
      },
      attackBox: { offset: { x: 100, y: 50 }, width: 160, height: 50 },
      context: c,
      gravity: gravity,
    });

    const enemy = new Fighter({
      position: { x: 400, y: 100 },
      velocity: { x: 0, y: 0 },
      color: 'blue',
      offset: { x: -50, y: 0 },
      imageSrc: kenjiIdleSrc,
      framesMax: 4,
      scale: 2.5,
      offset: { x: 215, y: 167 },
      sprites: {
        idle: { imageSrc: kenjiIdleSrc, framesMax: 4 },
        run: { imageSrc: kenjiRunSrc, framesMax: 8 },
        jump: { imageSrc: kenjiJumpSrc, framesMax: 2 },
        fall: { imageSrc: kenjiFallSrc, framesMax: 2 },
        attack1: { imageSrc: kenjiAttack1Src, framesMax: 4 },
        takeHit: { imageSrc: kenjiTakeHitSrc, framesMax: 3 },
        death: { imageSrc: kenjiDeathSrc, framesMax: 7 },
      },
      attackBox: { offset: { x: -170, y: 50 }, width: 170, height: 50 },
      context: c,
      gravity: gravity,
    });

    // Store instances in refs
    playerRef.current = player;
    enemyRef.current = enemy;
    backgroundRef.current = background;
    shopRef.current = shop;
  }

  // Reset game function
  function resetGame() {
    setTimer(60);
    setPlayerHealth(100);
    setEnemyHealth(100);
    setDisplayText('');
    initializeGame();
  }

  // Animation loop
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

    // Update health states
    if (playerHealth !== playerRef.current.health) {
      setPlayerHealth(playerRef.current.health);
    }
    if (enemyHealth !== enemyRef.current.health) {
      setEnemyHealth(enemyRef.current.health);
    }

    // Check for game over
    if (playerRef.current.health <= 0 || enemyRef.current.health <= 0) {
      determineWinner({ player: playerRef.current, enemy: enemyRef.current });
    }
  }

  // Handle key down events
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

    // Pause functionality
    if (event.key === 'Escape') {
      setIsPaused((prev) => !prev);
    }
  }

  // Handle key up events
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

  // Determine winner
  function determineWinner({ player, enemy }) {
    if (player.health === enemy.health) {
      setDisplayText('Tie');
    } else if (player.health > enemy.health) {
      setDisplayText('Player 1 Wins');
    } else if (player.health < enemy.health) {
      setDisplayText('Player 2 Wins');
    }
    setGameState('gameOver');
  }

  // Collision detection function
  function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
      rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
      rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
      rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
      rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
    );
  }

  // Sprite and Fighter classes
  class Sprite {
    constructor({ position, imageSrc, scale = 1, framesMax = 1, offset = { x: 0, y: 0 }, context }) {
      this.position = position;
      this.width = 50;
      this.height = 150;
      this.image = new Image();
      this.image.src = imageSrc;
      this.scale = scale;
      this.framesMax = framesMax;
      this.framesCurrent = 0;
      this.framesElapsed = 0;
      this.framesHold = 5;
      this.offset = offset;
      this.context = context;

      // Ensure the image is loaded before drawing
      this.image.onload = () => {
        this.loaded = true;
      };
      this.loaded = false;
    }

    draw() {
      if (this.loaded) {
        this.context.drawImage(
          this.image,
          this.framesCurrent * (this.image.width / this.framesMax),
          0,
          this.image.width / this.framesMax,
          this.image.height,
          this.position.x - this.offset.x,
          this.position.y - this.offset.y,
          (this.image.width / this.framesMax) * this.scale,
          this.image.height * this.scale
        );
      }
    }

    animateFrames() {
      this.framesElapsed++;

      if (this.framesElapsed % this.framesHold === 0) {
        if (this.framesCurrent < this.framesMax - 1) {
          this.framesCurrent++;
        } else {
          this.framesCurrent = 0;
        }
      }
    }

    update() {
      this.draw();
      this.animateFrames();
    }
  }

  class Fighter extends Sprite {
    constructor({
      position,
      velocity,
      color = 'red',
      imageSrc,
      scale = 1,
      framesMax = 1,
      offset = { x: 0, y: 0 },
      sprites,
      attackBox = { offset: {}, width: undefined, height: undefined },
      context,
      gravity,
    }) {
      super({ position, imageSrc, scale, framesMax, offset, context });

      this.velocity = velocity;
      this.width = 50;
      this.height = 150;
      this.lastKey = null;
      this.attackBox = {
        position: { x: this.position.x, y: this.position.y },
        offset: attackBox.offset,
        width: attackBox.width,
        height: attackBox.height,
      };
      this.color = color;
      this.isAttacking = false;
      this.alreadyHit = false;
      this.health = 100;
      this.framesCurrent = 0;
      this.framesElapsed = 0;
      this.framesHold = 5;
      this.sprites = sprites;
      this.dead = false;
      this.gravity = gravity;

      for (const sprite in this.sprites) {
        this.sprites[sprite].image = new Image();
        this.sprites[sprite].image.src = this.sprites[sprite].imageSrc;

        // Ensure each sprite image is loaded
        this.sprites[sprite].image.onload = () => {
          this.sprites[sprite].loaded = true;
        };
        this.sprites[sprite].loaded = false;
      }
    }

    update(keys) {
      this.draw();
      if (!this.dead) {
        this.animateFrames();
      }

      // Update attack box
      this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
      this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      // Apply gravity
      if (this.position.y + this.height + this.velocity.y >= this.context.canvas.height - 96) {
        this.velocity.y = 0;
        this.position.y = 330;
      } else {
        this.velocity.y += this.gravity;
      }

      // Movement logic
      this.velocity.x = 0;

      if (keys) {
        if (this === playerRef.current) {
          // Player controls
          if (keys.a.pressed && this.lastKey === 'a') {
            this.velocity.x = -5;
            this.switchSprite('run');
          } else if (keys.d.pressed && this.lastKey === 'd') {
            this.velocity.x = 5;
            this.switchSprite('run');
          } else {
            this.switchSprite('idle');
          }

          if (this.velocity.y < 0) {
            this.switchSprite('jump');
          } else if (this.velocity.y > 0) {
            this.switchSprite('fall');
          }
        } else if (this === enemyRef.current) {
          // Enemy controls
          if (keys.ArrowLeft.pressed && this.lastKey === 'ArrowLeft') {
            this.velocity.x = -5;
            this.switchSprite('run');
          } else if (keys.ArrowRight.pressed && this.lastKey === 'ArrowRight') {
            this.velocity.x = 5;
            this.switchSprite('run');
          } else {
            this.switchSprite('idle');
          }

          if (this.velocity.y < 0) {
            this.switchSprite('jump');
          } else if (this.velocity.y > 0) {
            this.switchSprite('fall');
          }
        }
      }

      // Collision detection and attacks
      const attackFramePlayer = 4; // Frame when player attack hits
      const attackFrameEnemy = 2; // Frame when enemy attack hits

      if (this === playerRef.current) {
        if (
          rectangularCollision({ rectangle1: playerRef.current, rectangle2: enemyRef.current }) &&
          playerRef.current.isAttacking &&
          !playerRef.current.alreadyHit &&
          playerRef.current.framesCurrent === attackFramePlayer
        ) {
          enemyRef.current.takeHit();
          playerRef.current.alreadyHit = true; // Prevent multiple hits in one attack

          gsap.to('#enemyHealth', {
            width: enemyRef.current.health + '%',
          });
        }
      } else if (this === enemyRef.current) {
        if (
          rectangularCollision({ rectangle1: enemyRef.current, rectangle2: playerRef.current }) &&
          enemyRef.current.isAttacking &&
          !enemyRef.current.alreadyHit &&
          enemyRef.current.framesCurrent === attackFrameEnemy
        ) {
          playerRef.current.takeHit();
          enemyRef.current.alreadyHit = true; // Prevent multiple hits in one attack

          gsap.to('#playerHealth', {
            width: playerRef.current.health + '%',
          });
        }
      }
    }

    attack() {
      if (this.isAttacking) return; // Prevent multiple attacks at the same time
      this.switchSprite('attack1');
      this.isAttacking = true;
      this.alreadyHit = false; // Reset alreadyHit when a new attack starts
    }

    takeHit() {
      this.health -= 20;

      if (this.health <= 0) {
        this.switchSprite('death');
      } else {
        this.switchSprite('takeHit');
      }
    }

    switchSprite(sprite) {
      // Handle death animation
      if (this.image === this.sprites.death.image) {
        if (this.framesCurrent === this.sprites.death.framesMax - 1) {
          this.dead = true;
        }
        return;
      }

      // Override other animations with attack animation
      if (this.image === this.sprites.attack1.image) {
        if (this.framesCurrent < this.sprites.attack1.framesMax - 1) {
          return;
        } else {
          // Attack animation has finished
          this.isAttacking = false; // Reset isAttacking flag
          this.alreadyHit = false; // Reset alreadyHit flag
        }
      }

      // Override when fighter gets hit
      if (
        this.image === this.sprites.takeHit.image &&
        this.framesCurrent < this.sprites.takeHit.framesMax - 1
      ) {
        return;
      }

      if (this.sprites[sprite].loaded) {
        switch (sprite) {
          case 'idle':
            if (this.image !== this.sprites.idle.image) {
              this.image = this.sprites.idle.image;
              this.framesMax = this.sprites.idle.framesMax;
              this.framesCurrent = 0;
            }
            break;
          case 'run':
            if (this.image !== this.sprites.run.image) {
              this.image = this.sprites.run.image;
              this.framesMax = this.sprites.run.framesMax;
              this.framesCurrent = 0;
            }
            break;
          case 'jump':
            if (this.image !== this.sprites.jump.image) {
              this.image = this.sprites.jump.image;
              this.framesMax = this.sprites.jump.framesMax;
              this.framesCurrent = 0;
            }
            break;
          case 'fall':
            if (this.image !== this.sprites.fall.image) {
              this.image = this.sprites.fall.image;
              this.framesMax = this.sprites.fall.framesMax;
              this.framesCurrent = 0;
            }
            break;
          case 'attack1':
            if (this.image !== this.sprites.attack1.image) {
              this.image = this.sprites.attack1.image;
              this.framesMax = this.sprites.attack1.framesMax;
              this.framesCurrent = 0;
            }
            break;
          case 'takeHit':
            if (this.image !== this.sprites.takeHit.image) {
              this.image = this.sprites.takeHit.image;
              this.framesMax = this.sprites.takeHit.framesMax;
              this.framesCurrent = 0;
            }
            break;
          case 'death':
            if (this.image !== this.sprites.death.image) {
              this.image = this.sprites.death.image;
              this.framesMax = this.sprites.death.framesMax;
              this.framesCurrent = 0;
            }
            break;
          default:
            break;
        }
      }
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Start Screen */}
      {gameState === 'start' && (
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
          <button onClick={() => setGameState('playing')}>Start Game</button>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
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
          <button
            onClick={() => {
              resetGame();
              setGameState('playing');
            }}
          >
            Restart Game
          </button>
        </div>
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
            <div
              style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
                borderTop: '4px solid white',
                borderLeft: '4px solid white',
                borderBottom: '4px solid white',
              }}
            >
              <div style={{ backgroundColor: 'red', height: '30px', width: '100%' }}></div>
              <div
                id="playerHealth"
                style={{
                  position: 'absolute',
                  background: '#818cf8',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: `${playerHealth}%`,
                  transition: 'width 0.5s ease',
                }}
              ></div>
            </div>

            {/* Timer */}
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

            {/* Enemy Health */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                borderTop: '4px solid white',
                borderBottom: '4px solid white',
                borderRight: '4px solid white',
              }}
            >
              <div style={{ backgroundColor: 'red', height: '30px' }}></div>
              <div
                id="enemyHealth"
                style={{
                  position: 'absolute',
                  background: '#818cf8',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  width: `${enemyHealth}%`,
                  transition: 'width 0.5s ease',
                }}
              ></div>
            </div>
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
