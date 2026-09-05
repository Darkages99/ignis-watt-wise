// ---------------------------------------------------------------------------
// Procedural "piezoelectric speed breaker" scene.
// progress 0..1 (auto-played on a loop) advances the 5 process steps:
//   0.00-0.20  vehicle wheel rolls over the platform
//   0.20-0.40  roller compresses the piezo disc stack (discs charge)
//   0.40-0.60  AC voltage generated (pulses emit)
//   0.60-0.80  DC rectifier — pulse travels along the conductor to the battery
//   0.80-1.00  battery fills, LED load lights up
// ---------------------------------------------------------------------------
import * as THREE from "three";
import type { DeviceModule } from "./stage";
import { ACCENTS } from "../content";

const CYAN = new THREE.Color(ACCENTS.blue);
const AMBER = new THREE.Color(ACCENTS.amber);

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};

export class SpeedBreaker implements DeviceModule {
  private root = new THREE.Group();
  private wheel = new THREE.Group();
  private discs: THREE.Mesh[] = [];
  private discMats: THREE.MeshStandardMaterial[] = [];
  private curve!: THREE.CatmullRomCurve3;
  private pulse!: THREE.Mesh;
  private battYlevel!: THREE.Mesh;
  private led!: THREE.Mesh;
  private ledMat!: THREE.MeshStandardMaterial;
  private discBaseY: number[] = [];

  build(scene: THREE.Scene) {
    this.root.position.y = -0.4;
    scene.add(this.root);

    // platform slab
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.4, 2.6),
      new THREE.MeshStandardMaterial({ color: 0x11151f, metalness: 0.6, roughness: 0.5 })
    );
    platform.position.set(-0.6, -0.2, 0);
    this.root.add(platform);

    // road markings
    for (let i = -1; i <= 1; i++) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.02, 0.14),
        new THREE.MeshStandardMaterial({ color: 0xffb020, emissive: 0x2a1c00 })
      );
      stripe.position.set(-0.6 + i * 0.8, 0.01, 1.0);
      this.root.add(stripe);
    }

    // piezo disc stack
    const discCount = 5;
    const discGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 40);
    for (let i = 0; i < discCount; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x243244,
        metalness: 0.7,
        roughness: 0.35,
        emissive: CYAN.clone().multiplyScalar(0),
      });
      const disc = new THREE.Mesh(discGeo, mat);
      const y = 0.16 + i * 0.14;
      disc.position.set(-0.6, y, 0);
      this.discBaseY.push(y);
      this.discs.push(disc);
      this.discMats.push(mat);
      this.root.add(disc);
    }

    // roller / wheel assembly (axis along z, so it "rolls" along x)
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 0.5, 40),
      new THREE.MeshStandardMaterial({ color: 0x0c0e14, metalness: 0.3, roughness: 0.8 })
    );
    tire.rotation.x = Math.PI / 2;
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.52, 24),
      new THREE.MeshStandardMaterial({ color: 0x8a94a6, metalness: 0.9, roughness: 0.25 })
    );
    hub.rotation.x = Math.PI / 2;
    this.wheel.add(tire, hub);
    this.wheel.position.set(-0.6, 1.5, 0);
    this.root.add(this.wheel);

    // conductor wire from disc stack to battery
    this.curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.6, 0.2, 0),
      new THREE.Vector3(0.4, 0.05, 0.4),
      new THREE.Vector3(1.4, 0.05, 0.2),
      new THREE.Vector3(2.1, 0.35, 0),
    ]);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(this.curve, 60, 0.035, 8, false),
      new THREE.MeshStandardMaterial({
        color: 0x2a3446,
        metalness: 0.8,
        roughness: 0.4,
        emissive: CYAN.clone().multiplyScalar(0.05),
      })
    );
    this.root.add(tube);

    // energy pulse
    this.pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: CYAN.clone(),
        emissiveIntensity: 3,
      })
    );
    this.pulse.visible = false;
    this.root.add(this.pulse);

    // battery
    const battery = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.9, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x161b26, metalness: 0.5, roughness: 0.5 })
    );
    battery.position.set(2.2, 0.45, 0);
    this.root.add(battery);
    this.battYlevel = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.78, 0.5),
      new THREE.MeshStandardMaterial({
        color: 0x0a2018,
        emissive: new THREE.Color(ACCENTS.green),
        emissiveIntensity: 1.4,
      })
    );
    this.battYlevel.position.set(2.2, 0.08, 0);
    this.battYlevel.scale.y = 0.001;
    this.root.add(this.battYlevel);

    // LED load on top of battery
    this.ledMat = new THREE.MeshStandardMaterial({
      color: 0x222833,
      emissive: AMBER.clone(),
      emissiveIntensity: 0,
    });
    this.led = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), this.ledMat);
    this.led.position.set(2.2, 1.1, 0);
    this.root.add(this.led);
    const ledLight = new THREE.PointLight(AMBER, 0, 4);
    ledLight.position.copy(this.led.position);
    this.led.userData.light = ledLight;
    this.root.add(ledLight);

    this.root.rotation.y = -0.5;
  }

  update(progress: number, time: number) {
    // gentle idle turntable
    this.root.rotation.y = -0.5 + Math.sin(time * 0.2) * 0.12 + progress * 0.25;

    // Step 1: wheel rolls in + descends onto stack
    const roll = smooth(0.0, 0.22, progress);
    const press = smooth(0.2, 0.4, progress);
    this.wheel.position.x = -2.4 + roll * 1.8; // rolls to -0.6
    this.wheel.position.y = 1.5 - press * 0.55; // descends to compress
    this.wheel.rotation.z -= 0.05; // spin

    // Step 2: disc stack compresses + charges
    const charge = press;
    for (let i = 0; i < this.discs.length; i++) {
      const squash = 1 - charge * 0.4 * (1 - i / this.discs.length);
      this.discs[i].scale.y = squash;
      this.discs[i].position.y = this.discBaseY[i] * (1 - charge * 0.22);
      const glow = charge * (0.6 + 0.4 * Math.sin(time * 6 + i));
      this.discMats[i].emissive.copy(CYAN).multiplyScalar(glow);
      this.discMats[i].emissiveIntensity = glow * 2;
    }

    // Step 3-4: pulse travels along conductor to battery
    const travel = smooth(0.42, 0.78, progress);
    if (travel > 0.001 && travel < 0.999) {
      this.pulse.visible = true;
      const pt = this.curve.getPoint(travel);
      this.pulse.position.copy(pt);
      const s = 1 + Math.sin(time * 12) * 0.25;
      this.pulse.scale.setScalar(s);
      // pulse colour shifts cyan(AC) -> amber(DC) as it passes the rectifier midpoint
      const dc = smooth(0.5, 0.7, progress);
      (this.pulse.material as THREE.MeshStandardMaterial).emissive
        .copy(CYAN)
        .lerp(AMBER, dc);
    } else {
      this.pulse.visible = false;
    }

    // Step 5: battery fills + LED lights
    const fill = smooth(0.78, 1.0, progress);
    this.battYlevel.scale.y = Math.max(0.001, fill);
    this.battYlevel.position.y = 0.08 + fill * 0.35;

    const lit = smooth(0.86, 1.0, progress);
    const flicker = lit * (0.7 + 0.3 * Math.sin(time * 10));
    this.ledMat.emissiveIntensity = flicker * 4;
    (this.led.userData.light as THREE.PointLight).intensity = flicker * 6;
  }
}
