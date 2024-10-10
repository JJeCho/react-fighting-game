// classes/Fighter.js

import Sprite from './Sprite';
import { rectangularCollision } from '../utils/collisionDetection';
import gsap from 'gsap';

export default class Fighter extends Sprite {
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
    playerRef,
    enemyRef,
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
    this.playerRef = playerRef;
    this.enemyRef = enemyRef;

    for (const sprite in this.sprites) {
      this.sprites[sprite].image = new Image();
      this.sprites[sprite].image.src = this.sprites[sprite].imageSrc;

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

    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y >= this.context.canvas.height - 96) {
      this.velocity.y = 0;
      this.position.y = 330;
    } else {
      this.velocity.y += this.gravity;
    }

    this.velocity.x = 0;

    if (keys) {
      if (this === this.playerRef.current) {
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
      } else if (this === this.enemyRef.current) {
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
    const attackFramePlayer = 4;
    const attackFrameEnemy = 2;

    if (this === this.playerRef.current) {
      if (
        rectangularCollision({ rectangle1: this.playerRef.current, rectangle2: this.enemyRef.current }) &&
        this.playerRef.current.isAttacking &&
        !this.playerRef.current.alreadyHit &&
        this.playerRef.current.framesCurrent === attackFramePlayer
      ) {
        this.enemyRef.current.takeHit();
        this.playerRef.current.alreadyHit = true;

        gsap.to('#enemyHealth', {
          width: this.enemyRef.current.health + '%',
        });
      }
    } else if (this === this.enemyRef.current) {
      if (
        rectangularCollision({ rectangle1: this.enemyRef.current, rectangle2: this.playerRef.current }) &&
        this.enemyRef.current.isAttacking &&
        !this.enemyRef.current.alreadyHit &&
        this.enemyRef.current.framesCurrent === attackFrameEnemy
      ) {
        this.playerRef.current.takeHit();
        this.enemyRef.current.alreadyHit = true;

        gsap.to('#playerHealth', {
          width: this.playerRef.current.health + '%',
        });
      }
    }
  }

  attack() {
    if (this.isAttacking) return;
    this.switchSprite('attack1');
    this.isAttacking = true;
    this.alreadyHit = false;
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
    if (this.image === this.sprites.death.image) {
      if (this.framesCurrent === this.sprites.death.framesMax - 1) {
        this.dead = true;
      }
      return;
    }

    if (this.image === this.sprites.attack1.image) {
      if (this.framesCurrent < this.sprites.attack1.framesMax - 1) {
        return;
      } else {
        this.isAttacking = false;
        this.alreadyHit = false;
      }
    }

    if (
      this.image === this.sprites.takeHit.image &&
      this.framesCurrent < this.sprites.takeHit.framesMax - 1
    ) {
      return;
    }

    if (this.sprites[sprite].loaded) {
      if (this.image !== this.sprites[sprite].image) {
        this.image = this.sprites[sprite].image;
        this.framesMax = this.sprites[sprite].framesMax;
        this.framesCurrent = 0;
      }
    }
  }
}
