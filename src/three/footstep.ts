// ---------------------------------------------------------------------------
// Procedural "footstep energy harvester" scene.
// progress 0..1 scrubbed across 4 steps:
//   0.00-0.25  footstep lands on the tile
//   0.25-0.50  stacked piezo layers compress (ripples radiate)
//   0.50-0.75  charge conditioned (pulse travels to the load)
//   0.75-1.00  sensors & lighting powered (lamp turns on)
// ---------------------------------------------------------------------------
import * as THREE from "three";
import type { DeviceModule } from "./stage";
import { ACCENTS } from "../content";

const GREEN = new THREE.Color(ACCENTS.green);

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};

export class Footstep implements DeviceModule {
  private root = new THREE.Group();
  private foot = new THREE.Group();
  private tile!: THREE.Mesh;
  private tileMat!: THREE.MeshStandardMaterial;
  private layers: THREE.Mesh[] = [];
  private layerMats: THREE.MeshStandardMaterial[] = [];
  private ripples: THREE.Mesh[] = [];
  private curve!: THREE.CatmullRomCurve3;
  private pulse!: THREE.Mesh;
  private lampMat!: THREE.MeshStandardMaterial;
  private lampLight!: THREE.PointLight;

  build(scene: THREE.Scene) {
    this.root.position.y = -0.6;
    this.root.rotation.y = 0.5;
    scene.add(this.root);

    // base plinth
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.3, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x10141d, metalness: 0.5, roughness: 0.6 })
    );
    base.position.y = -0.15;
    this.root.add(base);

    // stacked piezo layers
    const layerCount = 3;
    for (let i = 0; i < layerCount; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1d2a24,
        metalness: 0.6,
        roughness: 0.4,
        emissive: GREEN.clone().multiplyScalar(0),
      });
      const layer = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.08, 2.3), mat);
      layer.position.y = 0.06 + i * 0.11;
      this.layers.push(layer);
      this.layerMats.push(mat);
      this.root.add(layer);
    }

    // glass tile top
    this.tileMat = new THREE.MeshStandardMaterial({
      color: 0x24403a,
      metalness: 0.2,
      roughness: 0.15,
      emissive: GREEN.clone().multiplyScalar(0.05),
      transparent: true,
      opacity: 0.92,
    });
    this.tile = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 2.4), this.tileMat);
    this.tile.position.y = 0.45;
    this.root.add(this.tile);

    // ripple rings on the tile surface
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.3, 0.36, 48),
        new THREE.MeshBasicMaterial({
          color: GREEN,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.52;
      ring.visible = false;
      this.ripples.push(ring);
      this.root.add(ring);
    }

    // stylised foot (sole capsule + heel)
    const footMat = new THREE.MeshStandardMaterial({
      color: 0xe8edf5,
      metalness: 0.1,
      roughness: 0.7,
    });
    const sole = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.9, 8, 16), footMat);
    sole.rotation.z = Math.PI / 2;
    sole.scale.set(1, 1, 0.55);
    const heel = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 20), footMat);
    heel.position.set(-0.55, 0.05, 0);
    heel.scale.set(1, 0.9, 0.6);
    this.foot.add(sole, heel);
    this.foot.position.set(0.1, 2.4, 0);
    this.foot.rotation.y = -0.15;
    this.root.add(this.foot);

    // conductor to the lamp
    this.curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.4, 1.0),
      new THREE.Vector3(1.1, 0.1, 1.2),
      new THREE.Vector3(1.9, 0.6, 1.0),
      new THREE.Vector3(2.0, 1.6, 0.6),
    ]);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(this.curve, 50, 0.03, 8, false),
      new THREE.MeshStandardMaterial({
        color: 0x25352d,
        metalness: 0.7,
        roughness: 0.4,
        emissive: GREEN.clone().multiplyScalar(0.05),
      })
    );
    this.root.add(tube);

    this.pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: GREEN.clone(), emissiveIntensity: 3 })
    );
    this.pulse.visible = false;
    this.root.add(this.pulse);

    // lamp / sensor load
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 1.6, 12),
      new THREE.MeshStandardMaterial({ color: 0x2a3340, metalness: 0.8, roughness: 0.3 })
    );
    pole.position.set(2.05, 0.9, 0.5);
    this.root.add(pole);
    this.lampMat = new THREE.MeshStandardMaterial({
      color: 0x222833,
      emissive: GREEN.clone(),
      emissiveIntensity: 0,
    });
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), this.lampMat);
    lamp.position.set(2.05, 1.75, 0.5);
    this.root.add(lamp);
    this.lampLight = new THREE.PointLight(GREEN, 0, 5);
    this.lampLight.position.copy(lamp.position);
    this.root.add(this.lampLight);
  }

  update(progress: number, time: number) {
    this.root.rotation.y = 0.5 + Math.sin(time * 0.2) * 0.12 - progress * 0.2;

    // Step 1: foot descends
    const land = smooth(0.0, 0.25, progress);
    this.foot.position.y = 2.4 - land * 1.45; // rests just above tile
    // subtle bob after landing
    const press = smooth(0.25, 0.5, progress);

    // Step 2: tile + layers compress
    this.tile.position.y = 0.45 - press * 0.16;
    for (let i = 0; i < this.layers.length; i++) {
      const squash = 1 - press * 0.5 * (1 - i / this.layers.length);
      this.layers[i].scale.y = squash;
      const glow = press * (0.6 + 0.4 * Math.sin(time * 6 + i));
      this.layerMats[i].emissive.copy(GREEN).multiplyScalar(glow);
      this.layerMats[i].emissiveIntensity = glow * 2;
    }
    this.tileMat.emissiveIntensity = 0.05 + press * 1.2;
    this.foot.position.y = 0.95 - press * 0.16 + (land < 1 ? (2.4 - 1.45) - 0.95 : 0) * (1 - land);

    // ripples radiate during compression
    this.ripples.forEach((ring, i) => {
      const phase = (press * 2 + i * 0.33) % 1;
      if (press > 0.01) {
        ring.visible = true;
        const sc = 0.4 + phase * 3.2;
        ring.scale.setScalar(sc);
        (ring.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.5 * press;
      } else {
        ring.visible = false;
      }
    });

    // Step 3: pulse travels to lamp
    const travel = smooth(0.5, 0.8, progress);
    if (travel > 0.001 && travel < 0.999) {
      this.pulse.visible = true;
      this.pulse.position.copy(this.curve.getPoint(travel));
      this.pulse.scale.setScalar(1 + Math.sin(time * 12) * 0.25);
    } else {
      this.pulse.visible = false;
    }

    // Step 4: lamp powers on
    const lit = smooth(0.8, 1.0, progress);
    const flicker = lit * (0.75 + 0.25 * Math.sin(time * 8));
    this.lampMat.emissiveIntensity = flicker * 4;
    this.lampLight.intensity = flicker * 7;
  }
}
