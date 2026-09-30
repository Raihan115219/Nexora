"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { cn } from "@/lib/utils/format";
import { EthGlyph } from "./eth-glyph";

type V3 = [number, number, number];
type Face = { v: [V3, V3, V3]; hint: V3 };

/* ---------------------------------------------------------------------------
 * Geometry — the Ethereum mark as two faceted solids:
 *   upper crystal: square bipyramid (tall top, short bottom)
 *   lower chevron: concave top that mirrors the crystal's underside + bottom tip
 * Faces are oriented against an explicit "outward" hint so flat-shaded
 * normals are correct even on the concave chevron top.
 * ------------------------------------------------------------------------- */
const RADIUS = 0.8;
const TOP: V3 = [0, 1.25, 0];
const UPPER_BOTTOM: V3 = [0, -0.45, 0];
const CHEVRON_RING_Y = -0.2;
const CHEVRON_INNER: V3 = [0, -0.65, 0];
const CHEVRON_TIP: V3 = [0, -1.4, 0];

function ring(y: number): V3[] {
  return Array.from({ length: 4 }, (_, k) => {
    const a = (k * Math.PI) / 2;
    return [Math.cos(a) * RADIUS, y, Math.sin(a) * RADIUS] as V3;
  });
}

function buildFaces(): { upper: Face[]; lower: Face[] } {
  const upperRing = ring(0);
  const lowerRing = ring(CHEVRON_RING_Y);
  const upper: Face[] = [];
  const lower: Face[] = [];
  for (let k = 0; k < 4; k++) {
    const a = upperRing[k];
    const b = upperRing[(k + 1) % 4];
    const mx = (a[0] + b[0]) / 2;
    const mz = (a[2] + b[2]) / 2;
    upper.push({ v: [TOP, a, b], hint: [mx, 0.4, mz] });
    upper.push({ v: [UPPER_BOTTOM, a, b], hint: [mx, -0.6, mz] });

    const c = lowerRing[k];
    const d = lowerRing[(k + 1) % 4];
    lower.push({ v: [CHEVRON_INNER, c, d], hint: [0, 1, 0] });
    lower.push({ v: [CHEVRON_TIP, c, d], hint: [mx, -0.5, mz] });
  }
  return { upper, lower };
}

function buildGeometry(faces: Face[]): THREE.BufferGeometry {
  const positions: number[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const hint = new THREE.Vector3();
  for (const { v, hint: h } of faces) {
    a.fromArray(v[0]);
    b.fromArray(v[1]);
    c.fromArray(v[2]);
    normal.crossVectors(b.clone().sub(a), c.clone().sub(a));
    const ordered = normal.dot(hint.fromArray(h)) >= 0 ? v : [v[0], v[2], v[1]];
    for (const p of ordered) positions.push(...p);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  // Alternate facets between two materials for the logo's two-tone faceting.
  faces.forEach((_, i) => geometry.addGroup(i * 3, 3, i % 2));
  return geometry;
}

/* ------------------------------------------------------------------------- */

function StudioEnvironment({ intensity }: { intensity: number }) {
  const get = useThree((s) => s.get);
  useEffect(() => {
    // Local, procedural environment — gives the metal real reflections with no HDR download.
    const { gl, scene } = get();
    const pmrem = new THREE.PMREMGenerator(gl);
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = texture;
    scene.environmentIntensity = intensity;
    return () => {
      scene.environment = null;
      texture.dispose();
      pmrem.dispose();
    };
  }, [get, intensity]);
  return null;
}

function Solid({ geometry }: { geometry: THREE.BufferGeometry }) {
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 1), [geometry]);
  useEffect(
    () => () => {
      edges.dispose();
      geometry.dispose();
    },
    [edges, geometry],
  );
  return (
    <group>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          attach="material-0"
          color="#080d0a"
          metalness={0.92}
          roughness={0.34}
          clearcoat={1}
          clearcoatRoughness={0.18}
          emissive="#0b2a14"
          emissiveIntensity={0.35}
          flatShading
        />
        <meshPhysicalMaterial
          attach="material-1"
          color="#0f1a14"
          metalness={0.85}
          roughness={0.26}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive="#39ff5a"
          emissiveIntensity={0.05}
          flatShading
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#39ff5a" transparent opacity={0.55} toneMapped={false} />
      </lineSegments>
    </group>
  );
}

/* ---------------------------------------------------------------------------
 * Pointer interaction. DOM event handlers (on the wrapper) only write into this
 * plain mutable object and the render loop reads it, so moving the mouse never
 * triggers a React re-render.
 * ------------------------------------------------------------------------- */
class PointerState {
  hover = false;
  dragging = false;
  /** Pointer position over the element, -1..1 (x right, y down). */
  px = 0;
  py = 0;
  private dx = 0;
  private dy = 0;

  addDrag(dx: number, dy: number) {
    this.dx += dx;
    this.dy += dy;
  }

  /** Drag movement in px since the last call; resets the accumulator. */
  consumeDrag() {
    const out = { x: this.dx, y: this.dy };
    this.dx = 0;
    this.dy = 0;
    return out;
  }
}

type PointerRef = { current: PointerState };

const YAW_PER_PX = 0.012;
const PITCH_PER_PX = 0.008;
const MAX_PITCH = 0.7;
const BASE_PITCH = 0.06;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
/** Frame-rate independent exponential smoothing toward a target. */
const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));

function Crystal({ pointer, autoMotion }: { pointer: PointerRef; autoMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const motion = useRef({ yaw: Math.PI / 4, velocity: 0, pitch: 0, hoverPitch: 0, hoverYaw: 0 });
  const { upperGeometry, lowerGeometry } = useMemo(() => {
    const { upper, lower } = buildFaces();
    return { upperGeometry: buildGeometry(upper), lowerGeometry: buildGeometry(lower) };
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    // Clamp delta so returning to a background tab doesn't cause a jump.
    const dt = Math.min(delta, 1 / 20);
    const p = pointer.current;
    const m = motion.current;

    const drag = p.consumeDrag();
    if (p.dragging) {
      const dYaw = drag.x * YAW_PER_PX;
      m.yaw += dYaw;
      m.pitch = clamp(m.pitch + drag.y * PITCH_PER_PX, -MAX_PITCH, MAX_PITCH);
      // Track the release velocity so the spin carries on after letting go.
      m.velocity = damp(m.velocity, dYaw / Math.max(dt, 1 / 240), 20, dt);
    } else {
      m.yaw += m.velocity * dt;
      m.velocity *= Math.exp(-dt * 2.6);
      m.pitch = damp(m.pitch, 0, 3.2, dt);
      // Ease back into the slow idle spin (a touch slower while hovered).
      if (autoMotion) m.yaw += dt * (p.hover ? 0.14 : 0.32);
    }

    // Hover: tip the crystal toward the cursor.
    const engaged = p.hover || p.dragging;
    m.hoverPitch = damp(m.hoverPitch, engaged ? p.py * 0.3 : 0, 6, dt);
    m.hoverYaw = damp(m.hoverYaw, engaged ? p.px * 0.45 : 0, 6, dt);

    g.rotation.set(BASE_PITCH + m.pitch + m.hoverPitch, m.yaw + m.hoverYaw, 0);
    const float = autoMotion ? Math.sin(state.clock.elapsedTime * 1.1) * 0.07 : 0;
    g.position.y = damp(g.position.y, 0.08 + float + (p.dragging ? 0.03 : 0), 8, dt);
  });

  return (
    <group ref={group} position={[0, 0.08, 0]} rotation={[BASE_PITCH, Math.PI / 4, 0]}>
      <Solid geometry={upperGeometry} />
      <Solid geometry={lowerGeometry} />
    </group>
  );
}

function Lights({ pointer }: { pointer: PointerRef }) {
  const follow = useRef<THREE.PointLight>(null);

  // The soft green point light drifts toward the cursor for a live, reactive feel.
  useFrame((_, delta) => {
    const light = follow.current;
    if (!light) return;
    const dt = Math.min(delta, 1 / 20);
    const p = pointer.current;
    const engaged = p.hover || p.dragging;
    light.position.x = damp(light.position.x, 1.6 + (engaged ? p.px * 2.2 : 0), 5, dt);
    light.position.y = damp(light.position.y, 0.4 + (engaged ? -p.py * 1.4 : 0), 5, dt);
    light.intensity = damp(light.intensity, engaged ? 3.4 : 2.2, 5, dt);
  });

  return (
    <>
      <ambientLight intensity={0.08} />
      {/* soft neutral key */}
      <directionalLight position={[3, 4, 5]} intensity={0.55} color="#e8f5ec" />
      {/* green rim from behind */}
      <directionalLight position={[-3, 1.5, -4]} intensity={2.6} color="#39ff5a" />
      <directionalLight position={[3.5, -1, -3]} intensity={1.2} color="#46ff5f" />
      {/* soft green point light in front — follows the pointer */}
      <pointLight ref={follow} position={[1.6, 0.4, 2.6]} intensity={2.2} distance={8} decay={2} color="#39ff5a" />
    </>
  );
}

/* ------------------------------------------------------------------------- */

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/**
 * Animated 3D Ethereum crystal. Transparent background, sized by its parent.
 * Rendering pauses while the element is off-screen, and motion stops for
 * users who prefer reduced motion.
 */
export default function EthCrystal({ className }: { className?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const reducedMotion = usePrefersReducedMotion();
  const pointer = useRef(new PointerState());
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = container.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "80px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function track(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    pointer.current.px = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    pointer.current.py = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
  }

  function onPointerEnter(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return; // touch has no hover
    pointer.current.hover = true;
    track(e);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    track(e);
    const p = pointer.current;
    if (p.dragging) {
      p.addDrag(e.clientX - last.current.x, e.clientY - last.current.y);
      last.current = { x: e.clientX, y: e.clientY };
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointer.current.dragging = true;
    last.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = "grabbing";
    track(e);
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    pointer.current.dragging = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    e.currentTarget.style.cursor = "grab";
    if (e.pointerType === "touch") pointer.current.hover = false;
  }

  function onPointerLeave() {
    // While dragging, pointer capture keeps events flowing, so only un-hover otherwise.
    if (!pointer.current.dragging) pointer.current.hover = false;
  }

  return (
    <div
      ref={container}
      // pan-y: vertical swipes still scroll the page on touch; horizontal drags spin the crystal.
      className={cn("relative touch-pan-y select-none", className)}
      style={{ cursor: "grab" }}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={onPointerLeave}
      aria-hidden
    >
      <Canvas
        // Rendering continues while on screen so hover/drag stay responsive;
        // only the idle spin/float honours prefers-reduced-motion.
        frameloop={visible ? "always" : "never"}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        fallback={<EthGlyph className="size-full" />}
        style={{ background: "transparent", touchAction: "pan-y" }}
      >
        <StudioEnvironment intensity={0.22} />
        <Lights pointer={pointer} />
        <Crystal pointer={pointer} autoMotion={!reducedMotion} />
      </Canvas>
    </div>
  );
}
