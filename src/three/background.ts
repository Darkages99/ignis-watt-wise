// ---------------------------------------------------------------------------
// Ambient WebGL backdrop for the LIGHT theme.
// A subtle field of soft drifting "dust" in the current chapter's accent tone,
// rendered with normal blending at low opacity so it reads over a light page.
// Driven by a single `progress` (0..1 over the page) + gentle mouse parallax.
// ---------------------------------------------------------------------------
import * as THREE from "three";
import { ACCENTS } from "../content";

const COLOR_STOPS = [
  new THREE.Color(ACCENTS.violet), // problem
  new THREE.Color(ACCENTS.blue), // research / solutions
  new THREE.Color(ACCENTS.green), // analysis
  new THREE.Color(ACCENTS.amber), // conclusion
];

function colorForProgress(p: number, out: THREE.Color) {
  const scaled = p * (COLOR_STOPS.length - 1);
  const i = Math.min(COLOR_STOPS.length - 2, Math.floor(scaled));
  const f = scaled - i;
  out.copy(COLOR_STOPS[i]).lerp(COLOR_STOPS[i + 1], f);
  return out;
}

export class Background {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private points!: THREE.Points;
  private mat!: THREE.ShaderMaterial;
  private clock = new THREE.Clock();
  private mouse = new THREE.Vector2(0, 0);
  private mouseTarget = new THREE.Vector2(0, 0);
  private tintColor = new THREE.Color(ACCENTS.blue);
  private tintTarget = new THREE.Color(ACCENTS.blue);
  private progress = 0;
  private intro = 0;
  private running = true;
  private reduced: boolean;

  constructor(canvas: HTMLCanvasElement, reduced = false) {
    this.reduced = reduced;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    this.camera.position.set(0, 0, 14);

    this.buildParticles();
    this.resize();

    window.addEventListener("resize", this.resize);
    window.addEventListener("pointermove", this.onPointer);
    document.addEventListener("visibilitychange", () => {
      this.running = !document.hidden;
      if (this.running) this.loop();
    });

    this.loop();
  }

  private isMobile() {
    return window.innerWidth < 760;
  }

  private buildParticles() {
    const count = this.isMobile() ? 900 : 1800;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 48;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 28 - 4;
      seeds[i] = Math.random() * 6.28;
      sizes[i] = Math.random() * 1.2 + 0.35;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    this.mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: this.tintColor },
        uIntro: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
      },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        attribute float aSize;
        uniform float uTime;
        uniform float uIntro;
        uniform float uPixelRatio;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          float t = uTime * 0.12;
          p.x += sin(t + aSeed) * 0.8;
          p.y += cos(t * 0.8 + aSeed * 1.3) * 0.8;
          p *= mix(1.25, 1.0, smoothstep(0.0, 1.0, uIntro));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float twinkle = 0.55 + 0.45 * sin(uTime * 1.2 + aSeed * 3.0);
          vAlpha = twinkle * uIntro;
          gl_PointSize = aSize * uPixelRatio * (95.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          float a = smoothstep(0.5, 0.0, d);
          // low opacity dust that reads on a light background
          gl_FragColor = vec4(uColor, a * a * vAlpha * 0.22);
        }
      `,
    });

    this.points = new THREE.Points(geo, this.mat);
    this.scene.add(this.points);
  }

  private onPointer = (e: PointerEvent) => {
    this.mouseTarget.set(
      (e.clientX / window.innerWidth - 0.5) * 2,
      (e.clientY / window.innerHeight - 0.5) * 2
    );
  };

  private resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.mat) this.mat.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
  };

  setProgress(p: number) {
    this.progress = p;
    colorForProgress(p, this.tintTarget);
  }

  setIntro(v: number) {
    this.intro = v;
  }

  private loop = () => {
    if (!this.running) return;
    requestAnimationFrame(this.loop);
    const t = this.clock.getElapsedTime();

    this.mat.uniforms.uTime.value = t;
    this.mat.uniforms.uIntro.value += (this.intro - this.mat.uniforms.uIntro.value) * 0.05;

    this.tintColor.lerp(this.tintTarget, 0.04);
    this.mat.uniforms.uColor.value = this.tintColor;

    this.mouse.lerp(this.mouseTarget, this.reduced ? 1 : 0.045);
    this.camera.position.x = this.mouse.x * 1.4;
    this.camera.position.y = -this.mouse.y * 0.9;
    this.camera.lookAt(0, 0, 0);

    this.points.rotation.z = t * 0.006;

    this.renderer.render(this.scene, this.camera);
  };
}
