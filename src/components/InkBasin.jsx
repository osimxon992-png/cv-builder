import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// Suminagashi marbling on a 2D canvas, after Jaffer & Lu's "mathematical marbling":
// every drop and every comb stroke is an exact, area-preserving transform of all ink already on the water.
const VERTS = 160;
// Caps keep the per-frame work bounded on low-end phones.
const MAX_POLY_VERTS = 1200;
const MAX_DROPS = 48;

// Ink drops alternate with clear water drops, which is what makes suminagashi rings.
const INK = ['#0a1a33', '#1e2d4a', '#606d80', '#aeb6c2'];

function circle(cx, cy, r) {
  const pts = new Float32Array(VERTS * 2);
  for (let i = 0; i < VERTS; i++) {
    const a = (i / VERTS) * Math.PI * 2;
    pts[i * 2] = cx + Math.cos(a) * r;
    pts[i * 2 + 1] = cy + Math.sin(a) * r;
  }
  return pts;
}

// Pushes every existing point outward so the new drop's area appears: |p'-c|² = |p-c|² + r².
function pushOut(drops, cx, cy, r2) {
  for (const d of drops) {
    const p = d.pts;
    for (let i = 0; i < p.length; i += 2) {
      const dx = p[i] - cx;
      const dy = p[i + 1] - cy;
      const len2 = dx * dx + dy * dy || 1e-6;
      const k = Math.sqrt(1 + r2 / len2);
      p[i] = cx + dx * k;
      p[i + 1] = cy + dy * k;
    }
  }
}

// A stylus pulled from (bx,by) along unit (mx,my): points near the line move with it, falling off with distance.
function comb(drops, bx, by, mx, my, strength, lambda = 26, reach = 90) {
  const nx = -my;
  const ny = mx;
  const reach2 = 2 * reach * reach;
  for (const d of drops) {
    const p = d.pts;
    for (let i = 0; i < p.length; i += 2) {
      const qx = p[i] - bx;
      const qy = p[i + 1] - by;
      const dist = Math.abs(qx * nx + qy * ny);
      const along = qx * mx + qy * my;
      const s = ((strength * lambda) / (dist + lambda)) * Math.exp(-(along * along) / reach2);
      p[i] += mx * s;
      p[i + 1] += my * s;
    }
  }
}

// Combing stretches outlines; split long edges so curves stay smooth.
function refine(drops, maxEdge = 7) {
  const max2 = maxEdge * maxEdge;
  for (const d of drops) {
    const p = d.pts;
    const n = p.length / 2;
    if (n >= MAX_POLY_VERTS) continue;
    const out = [];
    for (let i = 0; i < n; i++) {
      const x = p[i * 2];
      const y = p[i * 2 + 1];
      const j = ((i + 1) % n) * 2;
      out.push(x, y);
      const dx = p[j] - x;
      const dy = p[j + 1] - y;
      if (dx * dx + dy * dy > max2 && out.length / 2 < MAX_POLY_VERTS) out.push(x + dx / 2, y + dy / 2);
    }
    if (out.length !== p.length) d.pts = Float32Array.from(out);
  }
}

const InkBasin = forwardRef(function InkBasin({ className = '', water = '#f6f7f9', palette = INK, seed = 'right', calm = false, label }, ref) {
  const canvasRef = useRef(null);
  const api = useRef(null);

  // drop(fx, fy): fx/fy are fractions of the basin's width and height.
  useImperativeHandle(ref, () => ({ drop: (fx, fy) => api.current?.drop(fx * api.current.w(), fy * api.current.h()) }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const still = calm || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let drops = [];
    let growing = []; // drops still swelling to full size
    let w = 0;
    let h = 0;
    let frame = 0;
    let raf = 0;
    let visible = true;
    let pointer = null;

    function paint() {
      ctx.fillStyle = water;
      ctx.fillRect(0, 0, w, h);
      // The newest ink is the darkest; older rings dilute toward feathered gray.
      let rank = drops.reduce((n, d) => n + (d.ink ? 1 : 0), 0);
      for (const d of drops) {
        let color = water;
        if (d.ink) {
          rank--;
          color = palette[rank < 3 ? 0 : rank < 9 ? 1 : rank < 20 ? 2 : 3] ?? palette[palette.length - 1];
        }
        const p = d.pts;
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    function addDrop(x, y, r, clear = false, instant = still) {
      const d = { pts: circle(x, y, instant ? r : 0.5), ink: !clear };
      if (instant) pushOut(drops, x, y, r * r);
      else growing.push({ d, x, y, r2: r * r, done: 0.25 });
      drops.push(d);
      if (drops.length > MAX_DROPS) drops = drops.slice(drops.length - MAX_DROPS);
    }

    // Thin ink, wide clear water: ring width follows each drop's area, so ink drops are small.
    function ring(x, y, count, r) {
      for (let i = 0; i < count; i++) addDrop(x, y, (i % 2 ? 0.55 : 0.2) * r * (1 - i * 0.05), i % 2 === 1, true);
    }

    function seedPattern() {
      drops = [];
      growing = [];
      const anchors =
        seed === 'center'
          ? [[0.72, 0.5, 0.26], [0.95, 0.15, 0.16]]
          : [[0.74, 0.4, 0.26], [0.95, 0.08, 0.14], [0.6, 0.9, 0.16]];
      const unit = Math.min(w, h) || 400;
      for (const [ax, ay, ar] of anchors) ring(ax * w, ay * h, 12, ar * unit + 20);
      refine(drops, 5);
      // A rake pulled back and forth across the water feathers the rings into suminagashi currents.
      const rows = 9;
      for (let k = 0; k < rows; k++) {
        const y = h * ((k + 0.5) / rows);
        const dir = k % 2 ? 1 : -1;
        for (let s = 0; s <= 30; s++) comb(drops, w * (dir > 0 ? s / 30 : 1 - s / 30), y, dir, 0, 26, 10, 60);
        refine(drops, 5);
      }
      // A second, slower pass across the first turns the bands into feathered chevrons.
      for (let k = 0; k < 4; k++) {
        const x = w * (0.55 + k * 0.13);
        for (let s = 0; s <= 20; s++) comb(drops, x, h * (s / 20), 0, 1, 12, 16, 60);
        refine(drops, 5);
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const nw = Math.max(1, rect.width);
      const nh = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(nw * dpr);
      canvas.height = Math.round(nh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const first = w === 0;
      w = nw;
      h = nh;
      if (first) seedPattern();
      paint();
    }

    function tick() {
      raf = 0;
      if (!visible) return;
      frame++;
      for (const g of growing) {
        // Swell quickly then settle: exponential ease-out on the drop's area.
        const step = Math.max(0.02, (1 - g.done) * 0.16);
        const add = Math.min(step, 1 - g.done);
        g.done += add;
        pushOut(drops.filter((d) => d !== g.d), g.x, g.y, g.r2 * add);
        const r = Math.sqrt(g.r2 * g.done);
        g.d.pts = circle(g.x, g.y, r);
      }
      growing = growing.filter((g) => g.done < 0.999);
      // The water breathes: a slow current sways back and forth through the ink, so the pattern
      // stays alive without drifting into mush over minutes (each swing undoes the last).
      const sway = Math.cos(frame / 70) * 0.9;
      comb(drops, w * 0.72, h * 0.45, 0.8, 0.6, sway, 90, Math.max(w, h) * 0.45);
      if (frame % 20 === 0) refine(drops);
      paint();
      raf = requestAnimationFrame(tick);
    }

    const start = () => {
      if (!still && !raf && visible) raf = requestAnimationFrame(tick);
    };

    function onDown(e) {
      const r = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - r.left, y: e.clientY - r.top, moved: 0 };
    }
    function onMove(e) {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      // Hovering combs gently; dragging pulls hard, like a stylus through the water.
      const prev = pointer ?? api.current.hover;
      api.current.hover = { x, y };
      if (!prev) return;
      const dx = x - prev.x;
      const dy = y - prev.y;
      const len = Math.hypot(dx, dy);
      if (len < 1) return;
      comb(drops, x, y, dx / len, dy / len, Math.min(len, 40) * (pointer ? 0.9 : 0.25), 22, pointer ? 70 : 45);
      if (pointer) {
        pointer.x = x;
        pointer.y = y;
        pointer.moved += len;
      }
      if (still) {
        refine(drops);
        paint();
      } else start();
    }
    function onUp(e) {
      if (pointer && pointer.moved < 6) {
        const r = canvas.getBoundingClientRect();
        api.current.drop(e.clientX - r.left, e.clientY - r.top);
      }
      pointer = null;
    }
    const onLeave = () => {
      api.current.hover = null;
      pointer = null;
    };

    api.current = {
      hover: null,
      w: () => w,
      h: () => h,
      drop(x = w * 0.7, y = h * 0.45, r = Math.min(w, h) * 0.09 + 18) {
        addDrop(x, y, r);
        addDrop(x, y, r * 0.62, true);
        addDrop(x, y, r * 0.4);
        if (still) {
          refine(drops);
          paint();
        } else start();
      },
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
      start();
    });
    io.observe(canvas);
    const onVis = () => {
      visible = !document.hidden;
      start();
    };
    document.addEventListener('visibilitychange', onVis);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onLeave);
    resize();
    start();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [water, palette, seed, calm]);

  return <canvas ref={canvasRef} className={`ink-basin ${className}`} role="img" aria-label={label} />;
});

export default InkBasin;
