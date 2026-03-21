/**
 * ChameleonIntro.jsx
 * Cyberpunk glitch chameleon intro sequence.
 *
 * Sequence:
 *   5 glitch cycles × 2.5s apart
 *   → chameleon flickers in (0.3s) → holds (1.5s) → glitches out (0.7s)
 *   → On 5th disappearance: particle scatter + "WELCOME" resolves from noise
 *   → Overlay fades out, calls onComplete()
 */

import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';

// ─── GLSL Shaders ────────────────────────────────────────────────────────────

const chameleonVert = /* glsl */`
  uniform float uTime;
  uniform float uGlitch;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  // pseudo-random
  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vNormal   = normalMatrix * normal;
    vPosition = position;
    vUv       = uv;

    vec3 pos = position;

    // Glitch: scatter vertices in bands
    if (uGlitch > 0.01) {
      float band   = floor(pos.y * 8.0);
      float rnd    = rand(vec2(band, floor(uTime * 20.0)));
      float rnd2   = rand(vec2(band + 1.0, floor(uTime * 13.0)));
      pos.x += rnd  * uGlitch * 0.6;
      pos.y += rnd2 * uGlitch * 0.3;
      pos.z += (rnd - 0.5) * uGlitch * 0.4;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const chameleonFrag = /* glsl */`
  uniform float uTime;
  uniform float uGlitch;
  uniform float uOpacity;
  uniform vec3  uColor;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // Base neon color cycling between cyan, magenta, green
    float t      = uTime * 0.5;
    vec3  cyan   = vec3(0.0, 1.0, 1.0);
    vec3  magenta = vec3(1.0, 0.0, 1.0);
    vec3  green  = vec3(0.0, 1.0, 0.255);

    float phase  = mod(t, 3.0);
    vec3  baseCol;
    if (phase < 1.0)      baseCol = mix(cyan,    magenta, phase);
    else if (phase < 2.0) baseCol = mix(magenta, green,   phase - 1.0);
    else                  baseCol = mix(green,   cyan,    phase - 2.0);

    // Fresnel edge glow
    vec3  viewDir = normalize(cameraPosition - vPosition);
    float fresnel = 1.0 - max(dot(normalize(vNormal), viewDir), 0.0);
    fresnel       = pow(fresnel, 2.0);

    vec3 col = mix(baseCol * 0.4, baseCol, fresnel);
    col      += baseCol * fresnel * 0.8; // extra glow on edges

    // Scanlines
    float scanline = sin(vPosition.y * 40.0 + uTime * 6.0);
    scanline       = smoothstep(0.4, 0.6, scanline * 0.5 + 0.5);
    col            *= mix(0.7, 1.0, scanline);

    // Glitch scanlines go haywire
    if (uGlitch > 0.01) {
      float gs = sin(vPosition.y * 120.0 + uTime * 40.0) * uGlitch;
      col.r    += gs * 0.5;
      col.b    -= gs * 0.3;
      // random block noise
      float noise = rand(vec2(floor(vUv.x * 8.0), floor(uTime * 30.0)));
      if (noise > 0.85) col = vec3(0.9, 0.1, 0.9) * uGlitch;
    }

    // Chromatic aberration tint on edges
    col.r += fresnel * 0.3 * (1.0 + uGlitch);
    col.b += fresnel * 0.2;

    gl_FragColor = vec4(col, uOpacity);
  }
`;

const particleVert = /* glsl */`
  uniform float uTime;
  uniform float uProgress; // 0 = just exploded, 1 = fully drifted

  attribute vec3 aVelocity;
  attribute float aSize;

  void main() {
    vec3 pos = position + aVelocity * uProgress * 2.5;
    pos.y   += uProgress * uProgress * 0.5; // upward drift

    vec4 mvPos     = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize   = aSize * (1.0 - uProgress * 0.7) * (300.0 / -mvPos.z);
    gl_Position    = projectionMatrix * mvPos;
  }
`;

const particleFrag = /* glsl */`
  uniform float uProgress;
  uniform float uTime;

  void main() {
    // Soft circle
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;

    float alpha = (1.0 - d * 2.0) * (1.0 - uProgress * 0.8);

    // Neon color cycle
    float t     = uTime * 0.8;
    vec3  col   = vec3(
      0.5 + 0.5 * sin(t),
      0.5 + 0.5 * sin(t + 2.094),
      0.5 + 0.5 * sin(t + 4.189)
    );

    gl_FragColor = vec4(col, alpha);
  }
`;

// ─── Chameleon Mesh ───────────────────────────────────────────────────────────
// Assembled from primitives; each part uses the same ShaderMaterial.

function ChameleonBody({ shaderRef }) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle breathing
      const breathe = 1.0 + Math.sin(t * 1.2) * 0.025;
      groupRef.current.scale.set(breathe, breathe, breathe);
      // Slow rotation so it shows off
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.4;
    }
  });

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   chameleonVert,
    fragmentShader: chameleonFrag,
    uniforms: {
      uTime:    { value: 0 },
      uGlitch:  { value: 0 },
      uOpacity: { value: 1 },
      uColor:   { value: new THREE.Color(0x00ffff) },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  // Expose material uniforms via ref
  useEffect(() => {
    if (shaderRef) shaderRef.current = mat;
  }, [mat, shaderRef]);

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.getElapsedTime();
  });

  // Build parts
  const body   = useMemo(() => new THREE.SphereGeometry(0.55, 10, 7), []);
  const head   = useMemo(() => new THREE.SphereGeometry(0.35, 8, 6), []);
  const eyeGeo = useMemo(() => new THREE.SphereGeometry(0.1, 6, 6), []);
  const legGeo = useMemo(() => new THREE.CylinderGeometry(0.07, 0.05, 0.45, 6), []);
  // Tail segments — progressively smaller
  const tailSegs = useMemo(() => [
    new THREE.SphereGeometry(0.18, 6, 5),
    new THREE.SphereGeometry(0.14, 6, 5),
    new THREE.SphereGeometry(0.10, 6, 5),
    new THREE.SphereGeometry(0.07, 6, 5),
    new THREE.SphereGeometry(0.04, 6, 5),
  ], []);
  // Crest (dorsal fin) segments
  const crestGeo = useMemo(() => new THREE.ConeGeometry(0.08, 0.22, 5), []);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Body */}
      <mesh geometry={body} material={mat} scale={[1.35, 0.75, 0.9]} />

      {/* Head */}
      <mesh geometry={head} material={mat} position={[0.78, 0.12, 0]} scale={[1.1, 0.85, 0.95]} />

      {/* Eyes */}
      <mesh geometry={eyeGeo} material={mat} position={[1.0,  0.28, 0.22]} />
      <mesh geometry={eyeGeo} material={mat} position={[1.0,  0.28, -0.22]} />

      {/* Legs — front */}
      <mesh geometry={legGeo} material={mat} position={[0.45, -0.55, 0.3]}  rotation={[0.3, 0, 0.2]} />
      <mesh geometry={legGeo} material={mat} position={[0.45, -0.55, -0.3]} rotation={[-0.3, 0, 0.2]} />
      {/* Legs — back */}
      <mesh geometry={legGeo} material={mat} position={[-0.45, -0.55, 0.3]}  rotation={[0.3, 0, -0.2]} />
      <mesh geometry={legGeo} material={mat} position={[-0.45, -0.55, -0.3]} rotation={[-0.3, 0, -0.2]} />

      {/* Tail — curled chain */}
      <mesh geometry={tailSegs[0]} material={mat} position={[-0.82, -0.05, 0]} />
      <mesh geometry={tailSegs[1]} material={mat} position={[-1.1,  -0.18, 0]} />
      <mesh geometry={tailSegs[2]} material={mat} position={[-1.3,  -0.38, 0]} />
      <mesh geometry={tailSegs[3]} material={mat} position={[-1.4,  -0.56, 0.1]} />
      <mesh geometry={tailSegs[4]} material={mat} position={[-1.42, -0.7,  0.22]} />

      {/* Dorsal crest */}
      <mesh geometry={crestGeo} material={mat} position={[ 0.35, 0.68, 0]} rotation={[0, 0,  0.15]} />
      <mesh geometry={crestGeo} material={mat} position={[ 0.0,  0.72, 0]} rotation={[0, 0,  0]} />
      <mesh geometry={crestGeo} material={mat} position={[-0.35, 0.68, 0]} rotation={[0, 0, -0.15]} />
    </group>
  );
}

// ─── Particle Explosion ───────────────────────────────────────────────────────

function ParticleExplosion({ active, onDone }) {
  const pointsRef = useRef();
  const progressRef = useRef(0);
  const doneFired = useRef(false);

  const COUNT = 400;

  const { positions, velocities, sizes } = useMemo(() => {
    const positions  = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    const sizes      = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Start clustered around origin (chameleon center)
      positions[i * 3]     = (Math.random() - 0.5) * 1.2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;

      // Random outward velocity
      velocities[i * 3]     = (Math.random() - 0.5) * 3.0;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 3.0 + 0.5;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 2.0;

      sizes[i] = Math.random() * 6 + 2;
    }
    return { positions, velocities, sizes };
  }, []);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   particleVert,
    fragmentShader: particleFrag,
    uniforms: {
      uProgress: { value: 0 },
      uTime:     { value: 0 },
    },
    transparent: true,
    depthWrite: false,
  }), []);

  useFrame(({ clock }, delta) => {
    if (!active) return;
    mat.uniforms.uTime.value     = clock.getElapsedTime();
    progressRef.current          = Math.min(progressRef.current + delta * 0.45, 1.0);
    mat.uniforms.uProgress.value = progressRef.current;

    if (progressRef.current >= 1.0 && !doneFired.current) {
      doneFired.current = true;
      onDone?.();
    }
  });

  if (!active) return null;

  return (
    <points ref={pointsRef} material={mat}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position"  array={positions}  itemSize={3} count={COUNT} />
        <bufferAttribute attach="attributes-aVelocity" array={velocities} itemSize={3} count={COUNT} />
        <bufferAttribute attach="attributes-aSize"     array={sizes}      itemSize={1} count={COUNT} />
      </bufferGeometry>
    </points>
  );
}

// ─── Welcome Text ─────────────────────────────────────────────────────────────

function WelcomeText({ visible }) {
  const textRef = useRef();
  const noiseRef = useRef(1.0); // starts glitchy

  useFrame(({ clock }, delta) => {
    if (!visible || !textRef.current) return;
    // Reduce noise over ~1.2s → clean text
    noiseRef.current = Math.max(0, noiseRef.current - delta * 0.85);

    const t = clock.getElapsedTime();
    // Subtle pulse once resolved
    const pulse = noiseRef.current < 0.1
      ? 0.85 + Math.sin(t * 3) * 0.15
      : 1.0;

    textRef.current.fillOpacity = pulse;

    // Glitch offset on the mesh while resolving
    if (noiseRef.current > 0.05) {
      textRef.current.position.x = (Math.random() - 0.5) * noiseRef.current * 0.3;
    } else {
      textRef.current.position.x = 0;
    }
  });

  if (!visible) return null;

  return (
    <Text
      ref={textRef}
      fontSize={0.7}
      color="#00ffff"
      anchorX="center"
      anchorY="middle"
      position={[0, 0, 0]}
      outlineWidth={0.02}
      outlineColor="#ff00ff"
      fillOpacity={1}
      letterSpacing={0.12}
    >
      WELCOME
    </Text>
  );
}

// ─── Scene Controller ─────────────────────────────────────────────────────────

// phase: 'idle' | 'chameleon' | 'particles' | 'welcome' | 'done'
function SceneController({ phase, glitchAmount, chameleonOpacity, onParticlesDone }) {
  const shaderRef = useRef(null);

  useFrame(() => {
    if (!shaderRef.current) return;
    shaderRef.current.uniforms.uGlitch.value  = glitchAmount;
    shaderRef.current.uniforms.uOpacity.value = chameleonOpacity;
  });

  return (
    <>
      {(phase === 'chameleon' || phase === 'glitching') && (
        <ChameleonBody shaderRef={shaderRef} />
      )}
      <ParticleExplosion
        active={phase === 'particles'}
        onDone={onParticlesDone}
      />
      <WelcomeText visible={phase === 'welcome' || phase === 'done'} />
    </>
  );
}

// ─── Background scanline static (CSS canvas) ─────────────────────────────────

function ScanlineStatic() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0,255,255,0.03) 2px,
        rgba(0,255,255,0.03) 4px
      )`,
      zIndex: 1,
    }} />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChameleonIntro({ onComplete }) {
  // 'chameleon' | 'glitching' | 'idle' | 'particles' | 'welcome' | 'fading'
  const [phase, setPhase]                 = useState('idle');
  const [glitchAmount, setGlitchAmount]   = useState(0);
  const [chameleonOpacity, setChameleonOpacity] = useState(0);
  const [overlayOpacity, setOverlayOpacity]     = useState(1);
  const [showOverlay, setShowOverlay]     = useState(true);

  const cycleRef = useRef(0);
  const TOTAL_CYCLES = 5;

  // Runs one glitch cycle: flicker in → hold → glitch out
  const runCycle = (cycleIndex) => {
    const isFinal = cycleIndex === TOTAL_CYCLES - 1;

    // Flicker in (0.3s)
    setPhase('chameleon');
    setChameleonOpacity(0);
    setGlitchAmount(0.15);

    let t = 0;
    const flickerIn = setInterval(() => {
      t += 0.05;
      setChameleonOpacity(Math.min(t / 0.3, 1.0));
      if (t >= 0.3) {
        clearInterval(flickerIn);
        setGlitchAmount(0);
        setChameleonOpacity(1);

        // Hold (1.5s) then glitch out
        setTimeout(() => {
          let gt = 0;
          const glitchOut = setInterval(() => {
            gt += 0.05;
            setGlitchAmount(gt / 0.7);
            setChameleonOpacity(1.0 - gt / 0.7);
            if (gt >= 0.7) {
              clearInterval(glitchOut);
              setGlitchAmount(1);
              setChameleonOpacity(0);

              if (isFinal) {
                // Final exit → particles
                setTimeout(() => {
                  setPhase('particles');
                }, 100);
              } else {
                // Go dark, schedule next cycle
                setPhase('idle');
                setTimeout(() => runCycle(cycleIndex + 1), 600);
              }
            }
          }, 50);
        }, 1500);
      }
    }, 50);
  };

  // Kick off first cycle after a brief delay
  useEffect(() => {
    const t = setTimeout(() => runCycle(0), 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleParticlesDone = () => {
    setPhase('welcome');
    // Hold WELCOME for 1.5s then fade
    setTimeout(() => {
      setPhase('fading');
      // Fade overlay over 1s
      let ft = 0;
      const fade = setInterval(() => {
        ft += 0.05;
        setOverlayOpacity(Math.max(0, 1 - ft));
        if (ft >= 1.0) {
          clearInterval(fade);
          setShowOverlay(false);
          onComplete?.();
        }
      }, 50);
    }, 1500);
  };

  if (!showOverlay) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: '#000',
      opacity: overlayOpacity,
      transition: 'opacity 0.05s linear',
    }}>
      <ScanlineStatic />

      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ position: 'absolute', inset: 0 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Ambient + point lights for any MeshStandardMaterial fallback */}
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 3]} intensity={2} color="#00ffff" />
        <pointLight position={[-3, -2, 2]} intensity={1.5} color="#ff00ff" />

        <SceneController
          phase={phase}
          glitchAmount={glitchAmount}
          chameleonOpacity={chameleonOpacity}
          onParticlesDone={handleParticlesDone}
        />
      </Canvas>

      {/* Corner decorations for cyberpunk feel */}
      <div style={{
        position: 'absolute', top: 16, left: 16,
        color: '#00ffff', fontFamily: 'monospace', fontSize: 11,
        opacity: 0.6, letterSpacing: 2, zIndex: 2,
      }}>
        SYS::INIT v2.77
      </div>
      <div style={{
        position: 'absolute', bottom: 16, right: 16,
        color: '#ff00ff', fontFamily: 'monospace', fontSize: 11,
        opacity: 0.6, letterSpacing: 2, zIndex: 2,
      }}>
        ID::LOADING...
      </div>
    </div>
  );
}
