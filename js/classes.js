class Sprite {
  constructor({
    position,
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
  }) {
    this.position = position;
    this.height = 150;
    this.width = 50;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.framesMax = framesMax;
    this.frameCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 20;
    this.offset = offset;
    // facing default (right). Subclasses may override.
    this.facing = "right";
  }
  draw() {
    // frame + dest sizes
    const frameWidth = this.image.width / this.framesMax;
    const frameHeight = this.image.height;
    const destWidth = frameWidth * this.scale;
    const destHeight = frameHeight * this.scale;
    const destX = this.position.x - this.offset.x;
    const destY = this.position.y - this.offset.y;

    c.save();
    if (this.facing === "left" && this === player) {
      // flip horizontally around the sprite's rectangle
      c.translate(destX + destWidth, 0);
      c.scale(-1, 1);
      c.drawImage(
        this.image,
        this.frameCurrent * frameWidth,
        0,
        frameWidth,
        frameHeight,
        0,
        destY,
        destWidth,
        destHeight
      );
    } else if (this.facing === "right" && this === enemy) {
      c.translate(destX + destWidth, 0);
      c.scale(-1, 1);
      c.drawImage(
        this.image,
        this.frameCurrent * frameWidth,
        0,
        frameWidth,
        frameHeight,
        0,
        destY,
        destWidth,
        destHeight
      );
    } else {
      // normal draw
      c.drawImage(
        this.image,
        this.frameCurrent * frameWidth,
        0,
        frameWidth,
        frameHeight,
        destX,
        destY,
        destWidth,
        destHeight
      );
    }
    c.restore();
  }
  animateFrame() {
    this.framesElapsed++;
    if (this.framesElapsed % this.framesHold === 0) {
      if (this.frameCurrent < this.framesMax - 1) {
        this.frameCurrent++;
      } else {
        this.frameCurrent = 0;
      }
    }
  }
  update() {
    this.draw();
    this.animateFrame();
  }
}

class Fighter extends Sprite {
  constructor({
    position,
    velocity,
    color = "red",
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    sprites,
    attackBox = { offset: { x: 0, y: 0 }, width: undefined, height: undefined },
  }) {
    super({
      position,
      imageSrc,
      scale,
      framesMax,
      offset,
    });
    this.velocity = velocity;
    this.height = 150;
    this.lastkey = undefined;
    this.width = 50;

    // Attack box config (treat offset.x as the RIGHT-facing offset by convention)
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      offset: {
        x: attackBox.offset.x || 0,
        y: attackBox.offset.y || 0,
      },
      width: attackBox.width,
      height: attackBox.height,
    };

    this.color = color;
    this.isAttacking = false;
    this.health = 100;
    this.frameCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 5;
    this.sprites = sprites;
    this.dead = false;
    this.facing = "right"; // default

    // Preload sprites images
    for (const sprite in this.sprites) {
      sprites[sprite].image = new Image();
      sprites[sprite].image.src = sprites[sprite].imageSrc;
    }
  }

  update() {
    this.draw();
    if (!this.dead) this.animateFrame();

    // update attack box position and mirror it based on facing
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;
    if (this == player) {
      if (this.facing === "right") {
        // right-facing:
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
      } else {
        // left-facing:
        this.attackBox.position.x =
          this.position.x -
          this.attackBox.offset.x -
          this.attackBox.width +
          this.width;
      }
    }
    if (this == enemy) {
      if (this.facing === "right") {
        // right-facing:
        this.attackBox.position.x =
          this.position.x +
          this.attackBox.offset.x -
          this.attackBox.width +
          this.width * 1.5;
      } else {
        // left-facing:
        this.attackBox.position.x = this.position.x - this.attackBox.offset.x;
      }
    }
    // // Debug: visualize attack box
    // c.fillStyle = "rgba(255, 0, 0, 1)";
    // c.fillRect(
    //   this.attackBox.position.x,
    //   this.attackBox.position.y,
    //   this.attackBox.width,
    //   this.attackBox.height
    // );

    this.position.y += this.velocity.y;
    this.position.x += this.velocity.x;

    // prevent going outside right
    if (this.position.x + this.width * this.scale > canvas.width) {
      this.position.x = canvas.width - this.width * this.scale;
    }
    //prevent going outside left
    if (this.position.x < 0) {
      this.position.x = 0;
    }
    //gravity
    if (this.position.y + this.height + this.velocity.y >= canvas.height - 96) {
      this.velocity.y = 0;
      this.position.y = 330;
    } else {
      this.velocity.y += gravity;
    }
  }

  attack() {
    // Randomly choose between attack1 and attack2
    const attackType = Math.random() < 0.5 ? "attack1" : "attack2";
    this.switchSprite(attackType);
    this.isAttacking = true;
  }

  takeHit() {
    // Record time of damage (useful for AI decisions)
    this.lastDamageTaken = Date.now();
    if (this === player) this.health -= 5;
    else {
      this.health -= 5.5;
    }
    if (this.health <= 0) {
      this.switchSprite("death");
    } else {
      this.switchSprite("takeHit");
      // small chance to counter-attack
      if (this === enemy && Math.random() < 0.3) {
        setTimeout(() => {
          if (!this.dead) {
            this.attack();
          }
        }, 300); // small delay before counter
      }
    }
  }

  switchSprite(sprite) {
    // if death animation finished -> stay dead
    if (this.image === this.sprites.death.image) {
      if (this.frameCurrent === this.sprites.death.framesMax - 1) {
        this.dead = true;
      }
      return;
    }

    // lock animation until attack / takeHit completes
    if (
      (this.image === this.sprites.attack1.image &&
        this.frameCurrent < this.sprites.attack1.framesMax - 1) ||
      (this.image === this.sprites.attack2.image &&
        this.frameCurrent < this.sprites.attack2.framesMax - 1)
    )
      return;

    if (
      this.image === this.sprites.takeHit.image &&
      this.frameCurrent < this.sprites.takeHit.framesMax - 1
    )
      return;

    switch (sprite) {
      case "idle":
        if (this.image !== this.sprites.idle.image) {
          this.image = this.sprites.idle.image;
          this.framesMax = this.sprites.idle.framesMax;
          this.frameCurrent = 0;
        }
        break;
      case "run":
        if (this.image !== this.sprites.run.image) {
          this.image = this.sprites.run.image;
          this.framesMax = this.sprites.run.framesMax;
          this.frameCurrent = 0;
        }
        break;
      case "jump":
        if (this.image !== this.sprites.jump.image) {
          this.image = this.sprites.jump.image;
          this.framesMax = this.sprites.jump.framesMax;
          this.frameCurrent = 0;
        }
        break;
      case "fall":
        if (this.image !== this.sprites.fall.image) {
          this.image = this.sprites.fall.image;
          this.framesMax = this.sprites.fall.framesMax;
          this.frameCurrent = 0;
        }
        break;
      case "attack1":
        if (this.image !== this.sprites.attack1.image) {
          this.image = this.sprites.attack1.image;
          this.framesMax = this.sprites.attack1.framesMax;
          this.frameCurrent = 0;
        }
        break;
      case "attack2":
        if (this.image !== this.sprites.attack2.image) {
          this.image = this.sprites.attack2.image;
          this.framesMax = this.sprites.attack2.framesMax;
          this.frameCurrent = 0;
        }
        break;
      case "takeHit":
        if (this.image !== this.sprites.takeHit.image) {
          this.image = this.sprites.takeHit.image;
          this.framesMax = this.sprites.takeHit.framesMax;
          this.frameCurrent = 0;
        }
        break;
      case "death":
        if (this.image !== this.sprites.death.image) {
          this.image = this.sprites.death.image;
          this.framesMax = this.sprites.death.framesMax;
          this.frameCurrent = 0;
        }
        break;
    }
  }
}
