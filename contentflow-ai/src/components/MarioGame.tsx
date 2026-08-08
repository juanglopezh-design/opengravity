"use client";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vec2 { x: number; y: number; }
interface Rect { x: number; y: number; w: number; h: number; }

interface Player {
  pos: Vec2; vel: Vec2;
  onGround: boolean; alive: boolean;
  invincible: number; // frames of invincibility after hit
  width: number; height: number;
  lives: number; score: number;
  coins: number;
}

interface Enemy {
  pos: Vec2; vel: Vec2;
  width: number; height: number;
  alive: boolean; type: "goomba" | "koopa";
  dying: number; // dying animation frames
  flipped: boolean; // koopa shell
}

interface Coin {
  pos: Vec2; width: number; height: number;
  collected: boolean; anim: number;
}

interface Block {
  rect: Rect;
  type: "ground" | "brick" | "question" | "pipe" | "cloud";
  hit: boolean;         // question block already used
  hitAnim: number;      // bounce animation frames
  coinPop?: { y: number; vy: number; visible: boolean }; // coin popping from block
}

interface Particle {
  pos: Vec2; vel: Vec2; life: number; color: string; size: number;
}

interface GameState {
  player: Player;
  enemies: Enemy[];
  coins: Coin[];
  blocks: Block[];
  particles: Particle[];
  camera: Vec2;
  time: number;       // countdown timer
  levelWidth: number;
  flagReached: boolean;
  flagY: number;
  gameOver: boolean;
  win: boolean;
  phase: "playing" | "dying" | "gameover" | "win";
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TILE = 40;
const GRAVITY = 0.55;
const JUMP_FORCE = -13.5;
const MOVE_SPEED = 4.2;
const MAX_FALL = 14;
const CANVAS_W = 800;
const CANVAS_H = 480;
const GROUND_Y = CANVAS_H - TILE * 2; // y of top of ground row

// ─── Level definition (tile map) ─────────────────────────────────────────────
// Each char: G=ground, B=brick, Q=question, P=pipe, C=cloud(bg), _=empty
// Row 0 = top of screen (row index 0..11)
const LEVEL_COLS = 80;
const LEVEL_ROWS = 12;

function buildLevel(): { blocks: Block[]; enemies: Enemy[]; coins: Coin[]; levelWidth: number } {
  const blocks: Block[] = [];
  const enemies: Enemy[] = [];
  const coins: Coin[] = [];

  const groundRow = LEVEL_ROWS - 2; // row 10
  const levelW = LEVEL_COLS * TILE;

  // Ground — full width except two gaps
  for (let col = 0; col < LEVEL_COLS; col++) {
    const isGap = (col >= 20 && col <= 21) || (col >= 45 && col <= 46) || (col >= 65 && col <= 66);
    if (!isGap) {
      // Two ground rows
      for (let r = groundRow; r < LEVEL_ROWS; r++) {
        blocks.push({ rect: { x: col * TILE, y: r * TILE, w: TILE, h: TILE }, type: "ground", hit: false, hitAnim: 0 });
      }
    }
  }

  // Question blocks row 1 (floating platform pattern)
  const qRow = 6;
  [5, 9, 10, 11, 16, 25, 26, 30, 38, 50, 55, 60].forEach(col => {
    blocks.push({ rect: { x: col * TILE, y: qRow * TILE, w: TILE, h: TILE }, type: "question", hit: false, hitAnim: 0 });
  });

  // Brick rows
  const brickRow = 6;
  [6, 7, 8, 12, 13, 27, 28, 31, 32, 33, 51, 52, 53].forEach(col => {
    blocks.push({ rect: { x: col * TILE, y: brickRow * TILE, w: TILE, h: TILE }, type: "brick", hit: false, hitAnim: 0 });
  });

  // Another brick/question platform higher up
  [18, 19, 21].forEach(col => {
    blocks.push({ rect: { x: col * TILE, y: 4 * TILE, w: TILE, h: TILE }, type: "brick", hit: false, hitAnim: 0 });
  });
  blocks.push({ rect: { x: 20 * TILE, y: 4 * TILE, w: TILE, h: TILE }, type: "question", hit: false, hitAnim: 0 });

  // Pipes
  const pipes: [number, number][] = [[14, 2], [35, 3], [42, 2], [57, 3], [70, 2]];
  pipes.forEach(([col, height]) => {
    for (let r = 0; r < height; r++) {
      blocks.push({ rect: { x: col * TILE, y: (groundRow - r) * TILE, w: TILE * 2, h: TILE }, type: "pipe", hit: false, hitAnim: 0 });
    }
  });

  // Staircase near end
  for (let step = 0; step < 5; step++) {
    for (let r = 0; r <= step; r++) {
      blocks.push({ rect: { x: (72 + step) * TILE, y: (groundRow - r) * TILE, w: TILE, h: TILE }, type: "ground", hit: false, hitAnim: 0 });
    }
  }

  // Enemies
  const enemyPositions: [number, "goomba" | "koopa"][] = [
    [8, "goomba"], [13, "goomba"], [17, "koopa"], [23, "goomba"],
    [29, "goomba"], [36, "koopa"], [40, "goomba"], [43, "goomba"],
    [48, "koopa"], [54, "goomba"], [58, "goomba"], [63, "koopa"], [68, "goomba"],
  ];
  enemyPositions.forEach(([col, type]) => {
    enemies.push({
      pos: { x: col * TILE, y: groundRow * TILE - TILE },
      vel: { x: -1.2, y: 0 },
      width: TILE - 4, height: TILE - 4,
      alive: true, type, dying: 0, flipped: false,
    });
  });

  // Coins on the ground level or floating
  const coinPositions: [number, number][] = [
    [3, groundRow - 1], [4, groundRow - 1], [15, 5], [16, 5],
    [25, 5], [26, 5], [31, 5], [32, 5], [50, 5], [51, 5],
    [60, 5], [61, 5], [64, groundRow - 1], [65, groundRow - 1],
  ];
  coinPositions.forEach(([col, row]) => {
    coins.push({ pos: { x: col * TILE + TILE / 2 - 8, y: row * TILE }, width: 16, height: 16, collected: false, anim: Math.random() * Math.PI * 2 });
  });

  return { blocks, enemies, coins, levelWidth: levelW };
}

// ─── AABB collision helpers ───────────────────────────────────────────────────
function rectsOverlap(ax: number, ay: number, aw: number, ah: number,
                      bx: number, by: number, bw: number, bh: number) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// ─── Physics: move entity and resolve blocks ──────────────────────────────────
function moveAndCollide(
  pos: Vec2, vel: Vec2, w: number, h: number,
  blocks: Block[], onHitTop?: (block: Block) => void
): { onGround: boolean } {
  let onGround = false;

  // Horizontal
  pos.x += vel.x;
  for (const b of blocks) {
    if (b.type === "cloud") continue;
    const { x, y, w: bw, h: bh } = b.rect;
    if (rectsOverlap(pos.x, pos.y, w, h, x, y, bw, bh)) {
      if (vel.x > 0) pos.x = x - w;
      else if (vel.x < 0) pos.x = x + bw;
      vel.x = 0;
    }
  }

  // Vertical
  pos.y += vel.y;
  for (const b of blocks) {
    if (b.type === "cloud") continue;
    const { x, y, w: bw, h: bh } = b.rect;
    if (rectsOverlap(pos.x, pos.y, w, h, x, y, bw, bh)) {
      if (vel.y > 0) {
        pos.y = y - h;
        onGround = true;
        vel.y = 0;
      } else if (vel.y < 0) {
        pos.y = y + bh;
        vel.y = 0;
        if (onHitTop) onHitTop(b);
      }
    }
  }
  return { onGround };
}

// ─── Particle helpers ─────────────────────────────────────────────────────────
function spawnParticles(particles: Particle[], x: number, y: number, color: string, count = 6) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 2 + Math.random() * 4;
    particles.push({
      pos: { x, y },
      vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed - 2 },
      life: 30 + Math.random() * 20,
      color,
      size: 4 + Math.random() * 4,
    });
  }
}

// ─── Initialise game state ────────────────────────────────────────────────────
function initGame(): GameState {
  const { blocks, enemies, coins, levelWidth } = buildLevel();
  return {
    player: {
      pos: { x: TILE * 2, y: GROUND_Y - TILE },
      vel: { x: 0, y: 0 },
      onGround: false, alive: true,
      invincible: 0,
      width: TILE - 6, height: TILE - 4,
      lives: 3, score: 0, coins: 0,
    },
    enemies, coins, blocks, particles: [],
    camera: { x: 0, y: 0 },
    time: 400,
    levelWidth,
    flagReached: false,
    flagY: TILE * 2,
    gameOver: false, win: false,
    phase: "playing",
  };
}

// ─── Update (game logic per frame) ────────────────────────────────────────────
function updateGame(
  state: GameState,
  keys: Set<string>,
  prevKeys: Set<string>,
  dt: number
): GameState {
  if (state.phase !== "playing") {
    // dying animation
    if (state.phase === "dying") {
      const p = state.player;
      p.vel.y += GRAVITY;
      p.pos.y += p.vel.y;
      if (p.pos.y > CANVAS_H + 100) {
        const newLives = p.lives - 1;
        if (newLives <= 0) return { ...state, phase: "gameover", player: { ...p, lives: 0 } };
        // respawn
        const fresh = initGame();
        fresh.player.lives = newLives;
        fresh.player.score = p.score;
        fresh.player.coins = p.coins;
        return fresh;
      }
      return { ...state, player: { ...p } };
    }
    return state;
  }

  const s = JSON.parse(JSON.stringify(state)) as GameState;
  const { player: pl, blocks, enemies, coins, particles } = s;

  // ── Timer ──
  s.time = Math.max(0, s.time - dt / 60);
  if (s.time <= 0) {
    s.phase = "dying";
    pl.vel = { x: 0, y: -10 };
    return s;
  }

  // ── Player input & physics ──
  if (pl.invincible > 0) pl.invincible--;

  const left  = keys.has("ArrowLeft")  || keys.has("KeyA");
  const right = keys.has("ArrowRight") || keys.has("KeyD");
  const jump  = keys.has("ArrowUp") || keys.has("KeyW") || keys.has("Space");
  const wasJump = prevKeys.has("ArrowUp") || prevKeys.has("KeyW") || prevKeys.has("Space");

  if (left)  pl.vel.x = Math.max(pl.vel.x - 1.2, -MOVE_SPEED);
  if (right) pl.vel.x = Math.min(pl.vel.x + 1.2,  MOVE_SPEED);
  if (!left && !right) pl.vel.x *= 0.75;

  if (jump && !wasJump && pl.onGround) pl.vel.y = JUMP_FORCE;
  pl.vel.y = Math.min(pl.vel.y + GRAVITY, MAX_FALL);

  const { onGround } = moveAndCollide(pl.pos, pl.vel, pl.width, pl.height, blocks, (b) => {
    if (b.type === "question" && !b.hit) {
      b.hit = true;
      b.hitAnim = 12;
      b.coinPop = { y: b.rect.y - TILE, vy: -6, visible: true };
      pl.score += 100;
      pl.coins++;
    } else if (b.type === "brick") {
      b.hitAnim = 8;
      spawnParticles(particles, b.rect.x + TILE / 2, b.rect.y, "#c8631c", 5);
      blocks.splice(blocks.indexOf(b), 1);
      pl.score += 50;
    }
  });
  pl.onGround = onGround;

  // Clamp to level
  pl.pos.x = Math.max(0, Math.min(pl.pos.x, s.levelWidth - pl.width));

  // Fell into pit
  if (pl.pos.y > CANVAS_H + 50) {
    s.phase = "dying";
    return s;
  }

  // ── Flag pole (end of level) ──
  const flagX = s.levelWidth - TILE * 4;
  if (!s.flagReached && pl.pos.x + pl.width >= flagX) {
    s.flagReached = true;
    pl.score += 2000;
  }
  if (s.flagReached) {
    s.flagY = Math.min(s.flagY + 4, GROUND_Y - TILE * 2);
    if (s.flagY >= GROUND_Y - TILE * 2) {
      s.phase = "win";
    }
  }

  // ── Enemies ──
  for (const e of enemies) {
    if (!e.alive) continue;
    if (e.dying > 0) {
      e.dying--;
      if (e.dying === 0) e.alive = false;
      continue;
    }
    e.vel.y = Math.min(e.vel.y + GRAVITY, MAX_FALL);
    const { onGround: eg } = moveAndCollide(e.pos, e.vel, e.width, e.height, blocks);
    if (eg && e.vel.x === 0) e.vel.x = -1.2; // unstuck after block collision
    if (e.pos.y > CANVAS_H + 50) { e.alive = false; continue; }

    // flip direction at edges (simple)
    if (e.pos.x <= 0 || e.pos.x + e.width >= s.levelWidth) e.vel.x *= -1;

    // Player ↔ Enemy collision
    if (pl.alive && pl.invincible === 0 &&
        rectsOverlap(pl.pos.x, pl.pos.y, pl.width, pl.height, e.pos.x, e.pos.y, e.width, e.height)) {
      const playerBottom = pl.pos.y + pl.height;
      if (playerBottom <= e.pos.y + e.height * 0.5 && pl.vel.y > 0) {
        // Stomp
        e.dying = 20;
        pl.vel.y = -8;
        pl.score += 200;
        spawnParticles(particles, e.pos.x + e.width / 2, e.pos.y, "#e74c3c", 6);
      } else if (pl.invincible === 0) {
        // Hurt
        pl.invincible = 120;
        s.phase = "dying";
        pl.vel = { x: 0, y: -10 };
      }
    }
  }

  // ── Coins ──
  for (const c of coins) {
    if (c.collected) continue;
    c.anim += 0.1;
    if (rectsOverlap(pl.pos.x, pl.pos.y, pl.width, pl.height, c.pos.x, c.pos.y, c.width, c.height)) {
      c.collected = true;
      pl.coins++;
      pl.score += 100;
      spawnParticles(particles, c.pos.x + c.width / 2, c.pos.y, "#f9ca24", 5);
    }
  }

  // ── Coin pops from question blocks ──
  for (const b of blocks) {
    if (b.hitAnim > 0) b.hitAnim--;
    if (b.coinPop && b.coinPop.visible) {
      b.coinPop.y += b.coinPop.vy;
      b.coinPop.vy += 0.5;
      if (b.coinPop.vy > 0 && b.coinPop.y >= b.rect.y - TILE) b.coinPop.visible = false;
    }
  }

  // ── Particles ──
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.pos.x += p.vel.x; p.pos.y += p.vel.y;
    p.vel.y += 0.25;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // ── Camera ──
  s.camera.x = Math.max(0, Math.min(pl.pos.x - CANVAS_W / 3, s.levelWidth - CANVAS_W));

  return s;
}

// ─── Renderer ─────────────────────────────────────────────────────────────────
function drawGame(ctx: CanvasRenderingContext2D, state: GameState, frame: number) {
  const { player: pl, blocks, enemies, coins, particles, camera } = state;
  const cx = camera.x;

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  sky.addColorStop(0, "#5c94fc");
  sky.addColorStop(1, "#8bbefc");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Background clouds (parallax, drawn independently of camera)
  const cloudPositions = [80, 280, 520, 750, 1000, 1300, 1600, 1900, 2200, 2600, 3000];
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  cloudPositions.forEach(cx2 => {
    const sx = cx2 - cx * 0.3;
    if (sx < -150 || sx > CANVAS_W + 150) return;
    drawCloud(ctx, sx, 60);
  });

  ctx.save();
  ctx.translate(-cx, 0);

  // Flag pole
  const flagX = state.levelWidth - TILE * 4;
  ctx.fillStyle = "#555";
  ctx.fillRect(flagX, TILE * 1, 8, CANVAS_H - TILE * 3);
  ctx.fillStyle = "#2ecc71";
  ctx.beginPath();
  ctx.moveTo(flagX + 8, state.flagY);
  ctx.lineTo(flagX + 50, state.flagY + 14);
  ctx.lineTo(flagX + 8, state.flagY + 28);
  ctx.closePath();
  ctx.fill();

  // Blocks
  for (const b of blocks) {
    const bx = b.rect.x, by = b.rect.y + (b.hitAnim > 0 ? -Math.sin(b.hitAnim * 0.4) * 5 : 0);
    const bw = b.rect.w, bh = b.rect.h;
    switch (b.type) {
      case "ground":   drawGroundTile(ctx, bx, by, bw, bh); break;
      case "brick":    drawBrickTile(ctx, bx, by, bw, bh); break;
      case "question": drawQuestionTile(ctx, bx, by, bw, bh, b.hit); break;
      case "pipe":     drawPipe(ctx, bx, by, bw, bh); break;
    }
    // Coin pop
    if (b.coinPop?.visible) {
      drawCoin(ctx, b.coinPop.y, b.rect.x + TILE / 2 - 8, 0);
    }
  }

  // Coins
  for (const c of coins) {
    if (!c.collected) drawCoin(ctx, c.pos.y, c.pos.x, c.anim);
  }

  // Enemies
  for (const e of enemies) {
    if (!e.alive) continue;
    if (e.type === "goomba") drawGoomba(ctx, e.pos.x, e.pos.y, e.width, e.height, e.dying > 0, frame);
    else drawKoopa(ctx, e.pos.x, e.pos.y, e.width, e.height, e.dying > 0, frame);
  }

  // Particles
  for (const p of particles) {
    ctx.globalAlpha = Math.min(1, p.life / 15);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.pos.x - p.size / 2, p.pos.y - p.size / 2, p.size, p.size);
    ctx.globalAlpha = 1;
  }

  // Player
  if (pl.alive || state.phase === "dying") {
    const blink = pl.invincible > 0 && Math.floor(pl.invincible / 6) % 2 === 0;
    if (!blink) drawPlayer(ctx, pl.pos.x, pl.pos.y, pl.width, pl.height, pl.vel.x, pl.onGround, frame);
  }

  ctx.restore();

  // HUD
  drawHUD(ctx, state);
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.arc(x + 30, y + 20, 20, 0, Math.PI * 2);
  ctx.arc(x + 55, y + 12, 26, 0, Math.PI * 2);
  ctx.arc(x + 85, y + 20, 20, 0, Math.PI * 2);
  ctx.fill();
}

function drawGroundTile(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "#5d8a2c";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#4a7023";
  ctx.fillRect(x, y + h * 0.35, w, h * 0.65);
  // grid lines
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

function drawBrickTile(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "#c8631c";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#a54910";
  // brick pattern
  ctx.fillRect(x + 2, y + h / 2, w - 4, 3);
  ctx.fillRect(x + 2, y + 2, w / 2 - 3, h / 2 - 4);
  ctx.fillRect(x + w / 2 + 1, y + 2, w / 2 - 3, h / 2 - 4);
  ctx.fillRect(x + w / 4, y + h / 2 + 3, w / 2, h / 2 - 5);
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

function drawQuestionTile(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, used: boolean) {
  ctx.fillStyle = used ? "#888" : "#f0a500";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = used ? "#ccc" : "#fff";
  ctx.font = `bold ${Math.floor(w * 0.55)}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(used ? "·" : "?", x + w / 2, y + h / 2 + 1);
}

function drawPipe(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = "#2ecc40";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#27ae36";
  ctx.fillRect(x + w * 0.6, y, w * 0.15, h);
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  // pipe head (top of stack)
  ctx.fillStyle = "#2ecc40";
  ctx.fillRect(x - 3, y, w + 6, 14);
  ctx.strokeRect(x - 3, y, w + 6, 14);
}

function drawCoin(ctx: CanvasRenderingContext2D, y: number, x: number, anim: number) {
  const scaleX = Math.abs(Math.cos(anim));
  ctx.save();
  ctx.translate(x + 8, y + 8);
  ctx.scale(scaleX, 1);
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#f9ca24";
  ctx.fill();
  ctx.strokeStyle = "#e6a817";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#fff8";
  ctx.beginPath();
  ctx.arc(-2, -2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
  velX: number, onGround: boolean, frame: number
) {
  // Body
  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(x, y, w, h * 0.55);
  // Overalls
  ctx.fillStyle = "#2980b9";
  ctx.fillRect(x, y + h * 0.55, w, h * 0.45);
  // Hat
  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(x - 2, y - 10, w + 4, 10);
  ctx.fillRect(x + 2, y - 16, w - 4, 8);
  // Face
  ctx.fillStyle = "#f5cba7";
  ctx.fillRect(x + 3, y + 4, w - 6, h * 0.3);
  // Eyes
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(x + w - 10, y + 6, 5, 5);
  // Mustache
  ctx.fillStyle = "#4a2a0a";
  ctx.fillRect(x + 2, y + h * 0.3, w - 4, 5);
  // Legs (animated)
  const legOffset = onGround && Math.abs(velX) > 0.5 ? Math.sin(frame * 0.35) * 5 : 0;
  ctx.fillStyle = "#2c3e50";
  ctx.fillRect(x + 2, y + h - 8, w / 2 - 2, 8 + legOffset);
  ctx.fillRect(x + w / 2 + 2, y + h - 8, w / 2 - 4, 8 - legOffset);
  // Buttons on overalls
  ctx.fillStyle = "#f9ca24";
  ctx.fillRect(x + 5, y + h * 0.6, 5, 5);
  ctx.fillRect(x + w - 10, y + h * 0.6, 5, 5);
}

function drawGoomba(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
  dying: boolean, frame: number
) {
  if (dying) {
    ctx.fillStyle = "#c0392b";
    ctx.fillRect(x, y + h - 10, w, 10);
    return;
  }
  // Body
  ctx.fillStyle = "#8B4513";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2 + 4, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + 4, y + 8, 10, 10);
  ctx.fillRect(x + w - 14, y + 8, 10, 10);
  ctx.fillStyle = "#111";
  ctx.fillRect(x + 6, y + 10, 6, 6);
  ctx.fillRect(x + w - 12, y + 10, 6, 6);
  // Feet
  const footWiggle = Math.sin(frame * 0.3) * 3;
  ctx.fillStyle = "#5D2E0C";
  ctx.fillRect(x + 2, y + h - 10, 14, 10 + footWiggle);
  ctx.fillRect(x + w - 16, y + h - 10, 14, 10 - footWiggle);
}

function drawKoopa(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
  dying: boolean, frame: number
) {
  if (dying) {
    ctx.fillStyle = "#27ae60";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  // Shell
  ctx.fillStyle = "#27ae60";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h * 0.6, w / 2, h * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1a7a45";
  ctx.lineWidth = 2;
  ctx.stroke();
  // Head
  ctx.fillStyle = "#f5cba7";
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 10, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.fillRect(x + w / 2 + 3, y + 7, 4, 5);
  // Legs
  const footWiggle = Math.sin(frame * 0.3) * 3;
  ctx.fillStyle = "#f5cba7";
  ctx.fillRect(x + 3, y + h - 8, 10, 8 + footWiggle);
  ctx.fillRect(x + w - 13, y + h - 8, 10, 8 - footWiggle);
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  const { player: pl, time } = state;
  // HUD bar
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(0, 0, CANVAS_W, 38);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 16px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`MARIO`, 16, 19);
  ctx.fillText(String(pl.score).padStart(6, "0"), 16, 35);

  ctx.textAlign = "center";
  ctx.fillText(`🪙 x${String(pl.coins).padStart(2, "0")}`, CANVAS_W / 2, 19);

  ctx.fillText(`WORLD 1-1`, CANVAS_W / 2, 35);

  ctx.textAlign = "right";
  ctx.fillText(`TIME`, CANVAS_W - 100, 19);
  ctx.fillStyle = time < 100 ? "#e74c3c" : "#fff";
  ctx.fillText(String(Math.ceil(time)).padStart(3, "0"), CANVAS_W - 16, 19);

  // Lives
  ctx.fillStyle = "#fff";
  ctx.textAlign = "right";
  ctx.fillText(`❤️ x${pl.lives}`, CANVAS_W - 16, 35);
}

// ─── Overlay screens ──────────────────────────────────────────────────────────
function drawOverlay(ctx: CanvasRenderingContext2D, state: GameState) {
  if (state.phase === "playing" || state.phase === "dying") return;

  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (state.phase === "gameover") {
    ctx.fillStyle = "#e74c3c";
    ctx.font = "bold 56px monospace";
    ctx.fillText("GAME OVER", CANVAS_W / 2, CANVAS_H / 2 - 30);
    ctx.fillStyle = "#fff";
    ctx.font = "24px monospace";
    ctx.fillText(`Score: ${state.player.score}`, CANVAS_W / 2, CANVAS_H / 2 + 20);
    ctx.font = "18px monospace";
    ctx.fillText("Press ENTER or tap to restart", CANVAS_W / 2, CANVAS_H / 2 + 60);
  } else if (state.phase === "win") {
    ctx.fillStyle = "#f9ca24";
    ctx.font = "bold 52px monospace";
    ctx.fillText("YOU WIN! 🎉", CANVAS_W / 2, CANVAS_H / 2 - 30);
    ctx.fillStyle = "#fff";
    ctx.font = "24px monospace";
    ctx.fillText(`Score: ${state.player.score}  Coins: ${state.player.coins}`, CANVAS_W / 2, CANVAS_H / 2 + 20);
    ctx.font = "18px monospace";
    ctx.fillText("Press ENTER or tap to play again", CANVAS_W / 2, CANVAS_H / 2 + 60);
  }
}

// ─── React Component ──────────────────────────────────────────────────────────
export default function MarioGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<GameState>(initGame());
  const keysRef   = useRef<Set<string>>(new Set());
  const prevKeysRef = useRef<Set<string>>(new Set());
  const frameRef  = useRef(0);
  const rafRef    = useRef<number>(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (down) keysRef.current.add(e.code);
      else keysRef.current.delete(e.code);
      // Restart
      if (down && e.code === "Enter") {
        const ph = stateRef.current.phase;
        if (ph === "gameover" || ph === "win") {
          stateRef.current = initGame();
          setStarted(true);
        }
      }
    };
    window.addEventListener("keydown", e => onKey(e, true));
    window.addEventListener("keyup",   e => onKey(e, false));

    let lastTime = 0;
    function loop(ts: number) {
      const dt = Math.min((ts - lastTime) / (1000 / 60), 3); // cap at 3 frames
      lastTime = ts;
      frameRef.current++;

      stateRef.current = updateGame(stateRef.current, keysRef.current, prevKeysRef.current, dt);
      prevKeysRef.current = new Set(keysRef.current);

      drawGame(ctx, stateRef.current, frameRef.current);
      drawOverlay(ctx, stateRef.current);

      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", e => onKey(e, true));
      window.removeEventListener("keyup",   e => onKey(e, false));
    };
  }, []);

  // Mobile controls
  const mobileBtn = (code: string, label: string, down: boolean) => {
    if (down) keysRef.current.add(code);
    else keysRef.current.delete(code);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", minHeight: "100vh", background: "#1a1a2e",
                  padding: "16px", fontFamily: "monospace" }}>
      <h1 style={{ color: "#f9ca24", fontSize: "28px", margin: "0 0 12px",
                   textShadow: "2px 2px 0 #c0392b, 4px 4px 0 rgba(0,0,0,0.3)" }}>
        🍄 Super ContentFlow Bros
      </h1>

      {!started && (
        <div style={{ position: "absolute", zIndex: 10, background: "rgba(0,0,0,0.7)",
                      color: "#fff", padding: "32px 48px", borderRadius: "12px",
                      textAlign: "center", fontSize: "18px", border: "3px solid #f9ca24" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎮</div>
          <div style={{ fontWeight: "bold", fontSize: "22px", color: "#f9ca24", marginBottom: "8px" }}>
            Super ContentFlow Bros
          </div>
          <div style={{ marginBottom: "16px", lineHeight: 1.7, fontSize: "15px" }}>
            ← → Arrow keys / WASD to move<br />
            ↑ / W / Space to jump<br />
            Stomp enemies, collect coins, reach the flag!
          </div>
          <button onClick={() => setStarted(true)}
            style={{ background: "#e74c3c", color: "#fff", border: "none",
                     padding: "12px 32px", fontSize: "18px", borderRadius: "8px",
                     cursor: "pointer", fontWeight: "bold", fontFamily: "monospace" }}>
            ▶ START GAME
          </button>
        </div>
      )}

      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ display: "block", border: "3px solid #f9ca24", borderRadius: "8px",
                   maxWidth: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
          onClick={() => {
            if (!started) setStarted(true);
            const ph = stateRef.current.phase;
            if (ph === "gameover" || ph === "win") stateRef.current = initGame();
          }}
        />
      </div>

      {/* Mobile controls */}
      <div style={{ display: "flex", gap: "12px", marginTop: "16px", alignItems: "center" }}>
        <MobileBtn label="◀" onPress={() => mobileBtn("ArrowLeft", "ArrowLeft", true)}
                   onRelease={() => mobileBtn("ArrowLeft", "ArrowLeft", false)} />
        <MobileBtn label="▶" onPress={() => mobileBtn("ArrowRight", "ArrowRight", true)}
                   onRelease={() => mobileBtn("ArrowRight", "ArrowRight", false)} />
        <div style={{ width: "16px" }} />
        <MobileBtn label="🦘 JUMP" onPress={() => mobileBtn("Space", "Space", true)}
                   onRelease={() => mobileBtn("Space", "Space", false)} big />
      </div>

      <div style={{ color: "#888", fontSize: "13px", marginTop: "12px" }}>
        Press ENTER to restart after game over
      </div>
    </div>
  );
}

function MobileBtn({ label, onPress, onRelease, big }: {
  label: string; onPress: () => void; onRelease: () => void; big?: boolean;
}) {
  return (
    <button
      onPointerDown={e => { e.preventDefault(); onPress(); }}
      onPointerUp={e => { e.preventDefault(); onRelease(); }}
      onPointerLeave={onRelease}
      style={{
        background: big ? "#e74c3c" : "#2c3e50",
        color: "#fff", border: "2px solid #f9ca24",
        padding: big ? "14px 24px" : "14px 20px",
        fontSize: big ? "16px" : "22px",
        borderRadius: "8px", cursor: "pointer",
        userSelect: "none", touchAction: "none",
        fontWeight: "bold", fontFamily: "monospace",
        minWidth: "60px",
      }}
    >
      {label}
    </button>
  );
}
