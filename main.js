import kaboom from "kaboom";
// props
import playerP from "./propirities/player";

const k = kaboom({ global: false, width: 1000, height: 600 });

k.loadSprite("player", "./assets/nave.png");

k.gravity(0);

// objects

const speedLabel = k.add([
  k.text("Speed: 0, x: 0, y:0", { size: 20 }),
  k.pos(12, 12),
  k.fixed(),
]);

const breakLabel = k.add([
  k.text("break: 100", { size: 20 }),
  k.pos(12, 40),
  k.fixed(),
]);

const player = k.add([
  k.sprite("player", { width: 90, height: 90 }),
  k.pos(300, 300),
  k.area({ scale: 1, height: 80, width: 80 }),
  k.rotate(0),
  k.origin("center"),
  k.body(),
  "player",
  {
    vel_x: 0,
    vel_y: 0,
    speed: 0,
    accelerating: false,
    breakPower: playerP.breakPower,
    break: playerP.breakInitial,
    breakMax: playerP.breakInitial,
    desacceleration: playerP.desacceleration,
    breaking: false,
  },
]);

const box = k.add([
  k.rect(100, 100),
  k.pos(500, 300),
  k.area(),
  "asteroid",
  k.health(10),
]);

// updates

k.loop(2, () => {
  if (player.break < player.breakMax) {
    player.break += 10;
    if (player.break > player.breakMax) {
      player.break = 100;
    }
    breakLabel.text = "break: " + player.break;
  }
});

//general update

player.onUpdate(() => {
  const { angle } = player;
  const radians = (angle - 90) * (Math.PI / 180);
  // acelereacion de la nave
  if (player.accelerating) {
    if (Math.abs(player.vel_x) <= playerP.Maxspeed) {
      const accelX = Math.cos(radians) * playerP.acceleration * 0.6;
      player.vel_x += accelX;
    } else {
      player.vel_x = player.vel_x > 0 ? 100 : -100;
    }

    if (Math.abs(player.vel_y) <= playerP.Maxspeed) {
      const accelY = Math.sin(radians) * playerP.acceleration * 0.6;
      player.vel_y += accelY;
    } else {
      player.vel_y = player.vel_y > 0 ? 100 : -100;
    }
  }
  // frenado de la nave
  if (player.breaking) {
    if (player.break > 0 && player.speed > 0) {
      if (player.vel_x !== 0) {
        if (player.vel_x < 0) {
          if (player.vel_x < 1) {
            player.vel_x = 0;
          } else {
            player.vel_x += 0.2 * player.breakPower;
          }
        } else {
          player.vel_x -= 0.2 * player.breakPower;
        }
      }
      if (player.vel_y !== 0) {
        if (player.vel_y > 0) {
          if (player.vel_y < 1) {
            player.vel_y = 0;
          } else {
            player.vel_y -= 0.2 * player.breakPower;
          }
        } else {
          player.vel_y += 0.2 * player.breakPower;
        }
      }
      player.break -= 1;
    }
  }
  // friccion de la nave
  if (player.vel_x !== 0) {
    if (player.vel_x > 0) {
      player.vel_x -= 0.03 * player.desacceleration;
    } else {
      player.vel_x += 0.03 * player.desacceleration;
    }
  }
  if (player.vel_y !== 0) {
    if (player.vel_y > 0) {
      player.vel_y -= 0.03 * player.desacceleration;
    } else {
      player.vel_y += 0.03 * player.desacceleration;
    }
  }

  const speed = Math.sqrt(
    Math.pow(player.vel_x, 2) + Math.pow(player.vel_y, 2)
  );
  player.speed = speed;
  speedLabel.text = `Speed: ${Math.round(speed)} x: ${Math.round(
    player.vel_x
  )}, y: ${Math.round(player.vel_y)}`;
  player.move(player.vel_x, player.vel_y);
  breakLabel.text = `break: ${player.break}`;
});

// coliders

k.onCollide("bullet", "asteroid", (b, e) => {
  b.destroy();
  e.hurt(1);
});

k.on("death", "asteroid", (e) => {
  e.destroy();
});

// constrolls

k.onKeyRelease("w", () => {
  player.accelerating = false;
});

k.onKeyDown("w", () => {
  player.accelerating = true;
});

k.onKeyDown("a", () => {
  player.angle -= playerP.speedRotation;
  if (player.angle < 0) {
    player.angle += 360;
  }
});

k.onKeyDown("d", () => {
  player.angle += playerP.speedRotation;
  if (player.angle > 360) {
    player.angle -= 360;
  }
});

k.onKeyRelease("s", () => {
  player.breaking = false;
});

k.onKeyDown("s", () => {
  player.breaking = true;
});

function spawnBullet() {
  const { angle } = player;
  const radians = (angle - 90) * (Math.PI / 180);
  // velocidad de la bala a vector
  const velX = Math.cos(radians);
  const velY = Math.sin(radians);
  // distancia del origen de la nave
  const distance = 28.16;
  // distacia y angulo de origen izquierdo respecto al centro de la nave
  const radiansOriginLeft = 105 * (Math.PI / 180);
  const originXLeft = Math.cos(radiansOriginLeft + radians);
  const originYLeft = Math.sin(radiansOriginLeft + radians);
  // distacia y angulo de origen derecho respecto al centro de la nave
  const radiansOriginRight = 254 * (Math.PI / 180);
  const originXRight = Math.cos(radiansOriginRight + radians);
  const originYRight = Math.sin(radiansOriginRight + radians);

  k.add([
    k.rect(5, 5),
    k.area(),
    k.pos(player.pos.sub(distance * originXLeft, distance * originYLeft)),
    k.origin("center"),
    k.color(200, 0, 0),
    k.cleanup(),
    k.rotate(angle),
    k.move(k.vec2(velX, velY), playerP.bulletSpeed),
    k.lifespan(1.5, { fade: 0.5 }),
    "bullet",
  ]);

  k.add([
    k.rect(5, 5),
    k.area(),
    k.pos(player.pos.sub(distance * originXRight, distance * originYRight)),
    k.origin("center"),
    k.color(200, 0, 0),
    k.cleanup(),
    k.rotate(angle),
    k.move(k.vec2(velX, velY), playerP.bulletSpeed),
    k.lifespan(1.5, { fade: 0.5 }),
    "bullet",
  ]);
}

k.onKeyPress("space", () => {
  spawnBullet();
});
