// ---------------------------------------------------------------------------
// Self-contained renderer for a device slide. Renders only when visible.
// In the scroll-snap deck each device gets its own slide, so the process
// AUTO-PLAYS on a loop (ramp 0->1, brief hold, restart) while the presenter
// narrates. `onProgress` lets the slide sync its step ticker.
// ---------------------------------------------------------------------------
import * as THREE from "three";

export interface DeviceModule {
  build(scene: THREE.Scene): void;
  update(progress: number, time: number): void;
  dispose?(): void;
}

export class Stage {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock = new THREE.Clock();
  private visible = false;
  private raf = 0;
  private module: DeviceModule;
  private el: HTMLElement;
  private startT = 0;
  private period: number;
  private hold: number;
  private onProgress?: (p: number) => void;
  private reduced: boolean;

  constructor(
    el: HTMLElement,
    module: DeviceModule,
    opts: { camZ?: number; period?: number; hold?: number; reduced?: boolean; onProgress?: (p: number) => void } = {}
  ) {
    this.el = el;
    this.module = module;
    this.period = opts.period ?? 9;
    this.hold = opts.hold ?? 1.6;
    this.onProgress = opts.onProgress;
    this.reduced = opts.reduced ?? false;

    const canvas = document.createElement("canvas");
    el.appendChild(canvas);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 1.6, opts.camZ ?? 7);
    this.camera.lookAt(0, 0, 0);

    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(4, 8, 6);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xbcd4ff, 1.2);
    rim.position.set(-6, 3, -4);
    this.scene.add(rim);
    this.scene.add(new THREE.AmbientLight(0x9fb2cc, 1.8));

    module.build(this.scene);
    this.resize();

    window.addEventListener("resize", this.resize);

    const io = new IntersectionObserver(
      (entries) => {
        this.visible = entries[0].isIntersecting;
        if (this.visible) {
          this.startT = this.clock.getElapsedTime();
          this.start();
        } else this.stop();
      },
      { threshold: 0.15 }
    );
    io.observe(el);
  }

  private resize = () => {
    const r = this.el.getBoundingClientRect();
    const size = Math.max(1, Math.min(r.width, r.height));
    this.renderer.setSize(size, size, false);
    this.camera.aspect = 1;
    this.camera.updateProjectionMatrix();
  };

  private computeProgress(t: number): number {
    if (this.reduced) return 1;
    const cycle = this.period + this.hold;
    const local = (t - this.startT) % cycle;
    if (local >= this.period) return 1; // hold at end
    const x = local / this.period;
    return x * x * (3 - 2 * x); // smoothstep ramp
  }

  private start() {
    if (this.raf) return;
    this.resize();
    const tick = () => {
      this.raf = requestAnimationFrame(tick);
      const t = this.clock.getElapsedTime();
      const p = this.computeProgress(t);
      this.module.update(p, t);
      this.onProgress?.(p);
      this.renderer.render(this.scene, this.camera);
    };
    this.raf = requestAnimationFrame(tick);
  }

  private stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
}
