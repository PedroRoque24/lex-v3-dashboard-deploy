import { memoryUrl } from '../lib/api';
import React, { useRef, useEffect } from "react";

const PARTICLE_COUNT = 3700;
const SKELETON_COUNT = 95;
const SIZE = 430;
const BASE_COLOR = "#fffbe0";
const MID_COLOR = "#ffd864";
const HOT_COLOR = "#ffc23a";
const GLOW_COLOR = "#ffe790";
const CORE_COLOR = "#fffbe6";

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function teardropXY(w, h) {
  let t = random(0, 2 * Math.PI);
  let rPow = Math.pow(random(0, 1), Math.random() < 0.22 ? 1.04 : 1.22);
  let r = rPow * (w / 2.02) * (1.17 - 0.33 * Math.cos(t));
  let cx = w / 2, cy = h * 0.99;
  let x = cx + Math.cos(t) * r * random(0.96, 1.15);
  let yTopBias = Math.random() < 0.22 ? 1.54 : 1.26;
  let y = cy - Math.abs(Math.sin(t)) * r * random(yTopBias, yTopBias + 0.14) * (0.93 + Math.pow(r / (w / 2.02), 2) * 0.17);
  if (Math.random() < 0.13) { x += random(-12, 12); y += random(-8, 14); }
  return [x, y];
}

function bushSkeletonXY(w, h, i, total) {
  let t = (2 * Math.PI * i) / total;
  let r = (w / 2.04) * (0.98 - 0.26 * Math.cos(t));
  let cx = w / 2, cy = h * 0.99;
  let yBias = t < Math.PI ? 1.46 : 1.26;
  let x = cx + Math.cos(t) * r;
  let y = cy - Math.abs(Math.sin(t)) * r * yBias * (0.92 + 0.13 * Math.abs(Math.cos(t)));
  return [x, y];
}

function makeParticles(w, h) {
  let arr = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let [x, y] = teardropXY(w, h);
    let core = Math.hypot(x - w / 2, y - h * 1.03) < w * 0.22;
    arr.push({
      x, y,
      baseX: x,
      baseY: y,
      core,
      r: i % 61 === 0 ? random(1.17, 1.8) : random(0.10, 0.21),
      dx: random(-0.13, 0.13),
      dy: random(-0.14, 0.07),
      glow: i % 81 === 0 ? random(0.59, 1.11) : random(0.09, 0.17),
      alpha: core ? random(0.22, 0.48) : random(0.15, 0.24),
      t: random(0, Math.PI * 2),
      speed: random(0.12, 0.22),
      swirl: random(2.05, 3.5),
      chaos: random(1.13, 2.48),
      burst: random(1.31, 3.1),
      orbitR: random(2, 16),
      orbitTheta: random(0, Math.PI*2),
      orbitSpeed: random(0.002, 0.018),
      lift: Math.random() < 0.33,
      life: random(170, 690),
    });
  }
  return arr;
}

function makeSkeletonParticles(w, h, count) {
  let arr = [];
  for (let i = 0; i < count; i++) {
    let [x, y] = bushSkeletonXY(w, h, i, count);
    arr.push({
      x, y,
      baseX: x,
      baseY: y,
      r: random(0.19, 0.32),
      alpha: random(0.38, 0.67),
      flickerT: random(0, Math.PI * 2),
      glow: random(0.6, 1.0),
    });
  }
  return arr;
}

const LexBurningBush = ({ size = SIZE, style = {}, className = "" }) => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let w = size, h = size * 1.41;
    let particles = makeParticles(w, h);
    let skeleton = makeSkeletonParticles(w, h, SKELETON_COUNT);

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // --- Static bush outline particles first ---
      let flickerBase = Date.now() * 0.0015;
      for (let s of skeleton) {
        let flicker = Math.sin(flickerBase + s.flickerT) * 0.2 + Math.cos(flickerBase * 0.7 + s.flickerT * 1.13) * 0.11;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r + flicker * 0.18, 0, 2 * Math.PI);
        ctx.shadowColor = "#fffbe0";
        ctx.shadowBlur = 11 + s.glow * 13;
        ctx.globalAlpha = s.alpha + flicker * 0.3;
        ctx.fillStyle = "#fffbe0";
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      // --- Animated dancy bush embers ---
      let t_global = Date.now() * 0.0055;
      for (let p of particles) {
        p.t += p.speed;
        p.orbitTheta += p.orbitSpeed;
        let orbitX = Math.cos(p.orbitTheta + p.t) * p.orbitR * (1 + 0.2 * Math.sin(p.t));
        let orbitY = Math.sin(p.orbitTheta + p.t) * p.orbitR * (1 + 0.2 * Math.cos(p.t * 1.3));
        let swirl = Math.sin(t_global + p.t * p.swirl) * p.chaos * 0.75;
        let burst = Math.sin(t_global * 1.7 + p.t * 2.7 + p.baseX * 0.012) * p.chaos * 0.31 * p.burst;
        let flicker = Math.sin(p.t * 9 + t_global * 3 + p.x * 0.017) * 0.63;
        if (p.lift) p.y -= random(0.07, 0.23);
        p.x += Math.sin(p.t + p.baseY * 0.013) * 0.17 + swirl + burst + flicker * 0.10 + orbitX * 0.31;
        p.y += Math.cos(p.t + p.baseX) * 0.19 + swirl * 0.32 + burst * 0.16 + flicker * 0.09 + orbitY * 0.31;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);

        if (p.core) {
          ctx.shadowColor = CORE_COLOR;
          ctx.shadowBlur = 28 + p.glow * 56;
          ctx.globalAlpha = 0.44 + p.glow * 1.7 + p.alpha;
          ctx.fillStyle = p.r > 1.0 ? HOT_COLOR : MID_COLOR;
        } else if (p.r > 1.10 || p.glow > 0.13) {
          ctx.shadowColor = GLOW_COLOR;
          ctx.shadowBlur = 10 + p.glow * 17;
          ctx.globalAlpha = 0.23 + p.glow * 1.4 + p.alpha;
          ctx.fillStyle = MID_COLOR;
        } else {
          ctx.shadowColor = GLOW_COLOR;
          ctx.shadowBlur = 6 + p.glow * 7;
          ctx.globalAlpha = 0.16 + p.glow * 1.1 + p.alpha;
          ctx.fillStyle = BASE_COLOR;
        }
        ctx.fill();

        // Extra haze
        if (p.core && p.r < 0.16 && Math.random() < 0.08) {
          ctx.globalAlpha = 0.10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 12.4, 0, 2 * Math.PI);
          ctx.fillStyle = CORE_COLOR;
          ctx.fill();
        } else if (!p.core && p.r < 0.13 && Math.random() < 0.05) {
          ctx.globalAlpha = 0.05;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 8.2, 0, 2 * Math.PI);
          ctx.fillStyle = BASE_COLOR;
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Respawn for edge/fuzz
        p.life -= 1;
        if (
          p.life < 0 ||
          p.x < w * 0.01 ||
          p.x > w * 0.99 ||
          p.y < h * 0.01 ||
          p.y > h * 0.99
        ) {
          let [nx, ny] = teardropXY(w, h);
          let core = Math.hypot(nx - w / 2, ny - h * 1.03) < w * 0.22;
          p.x = nx; p.y = ny;
          p.baseX = nx; p.baseY = ny;
          p.core = core;
          p.r = Math.random() < 0.011 ? random(1.17, 1.8) : random(0.10, 0.21);
          p.dx = random(-0.13, 0.13);
          p.dy = random(-0.14, 0.07);
          p.glow = Math.random() < 0.013 ? random(0.59, 1.11) : random(0.09, 0.17);
          p.alpha = core ? random(0.22, 0.48) : random(0.15, 0.24);
          p.t = random(0, Math.PI * 2);
          p.speed = random(0.12, 0.22);
          p.swirl = random(2.05, 3.5);
          p.chaos = random(1.13, 2.48);
          p.burst = random(1.31, 3.1);
          p.orbitR = random(2, 16);
          p.orbitTheta = random(0, Math.PI*2);
          p.orbitSpeed = random(0.002, 0.018);
          p.lift = Math.random() < 0.33;
          p.life = random(170, 690);
        }
      }
      ctx.shadowBlur = 0;
      requestAnimationFrame(draw);
    }
    draw();
    return () => {};
  }, [size]);

  return (
    <div
      style={{
        width: size,
        height: size * 1.41,
        position: "relative",
        background: "transparent",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        ...style
      }}
      className={className}
    >
      <canvas
        ref={ref}
        width={size}
        height={size * 1.41}
        style={{
          width: size,
          height: size * 1.41,
          borderRadius: "49%",
          background: "transparent"
        }}
      />
    </div>
  );
};

export default LexBurningBush;
