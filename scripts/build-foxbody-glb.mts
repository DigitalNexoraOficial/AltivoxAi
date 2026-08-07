/**
 * Builds a Fox-body Mustang GT (~1987–1993) GLB with named parts for scroll animation.
 * Run: npx tsx scripts/build-foxbody-glb.mts
 */
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Node polyfill required by GLTFExporter
class FileReaderPolyfill {
  result: string | ArrayBuffer | null = null;
  onloadend: ((ev: unknown) => void) | null = null;
  onerror: ((ev: unknown) => void) | null = null;
  readAsArrayBuffer(blob: Blob) {
    blob
      .arrayBuffer()
      .then((buf) => {
        this.result = buf;
        this.onloadend?.({});
      })
      .catch((e) => this.onerror?.(e));
  }
  readAsDataURL(blob: Blob) {
    blob
      .arrayBuffer()
      .then((buf) => {
        const b64 = Buffer.from(buf).toString("base64");
        this.result = `data:${blob.type || "application/octet-stream"};base64,${b64}`;
        this.onloadend?.({});
      })
      .catch((e) => this.onerror?.(e));
  }
}
(globalThis as unknown as { FileReader: unknown }).FileReader = FileReaderPolyfill;

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(
  __dirname,
  "../public/assets/encargos/mustang/foxbody.glb"
);

function paintMat(color = 0xb01018) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.72,
    roughness: 0.28,
    name: "Paint",
  });
}
function darkMat() {
  return new THREE.MeshStandardMaterial({
    color: 0x111318,
    metalness: 0.55,
    roughness: 0.4,
    name: "Dark",
  });
}
function chromeMat() {
  return new THREE.MeshStandardMaterial({
    color: 0xc9d0db,
    metalness: 1,
    roughness: 0.15,
    name: "Chrome",
  });
}
function glassMat() {
  return new THREE.MeshStandardMaterial({
    color: 0x6ec0e0,
    metalness: 0.2,
    roughness: 0.05,
    transparent: true,
    opacity: 0.35,
    name: "Glass",
  });
}
function leatherMat() {
  return new THREE.MeshStandardMaterial({
    color: 0x2a211c,
    roughness: 0.85,
    metalness: 0.05,
    name: "Leather",
  });
}
function engineMat() {
  return new THREE.MeshStandardMaterial({
    color: 0x2f343c,
    metalness: 0.88,
    roughness: 0.32,
    name: "Engine",
  });
}

/** Fox-body side silhouette (nose +X), meters-ish units. */
function foxSideShape(): THREE.Shape {
  const s = new THREE.Shape();
  // bottom front → rear (ground clearance line)
  s.moveTo(2.15, 0.08);
  s.lineTo(2.15, 0.22);
  // nose / bumper
  s.lineTo(2.05, 0.35);
  s.lineTo(1.95, 0.42);
  // hood line (long)
  s.lineTo(0.55, 0.55);
  // windshield
  s.lineTo(0.15, 0.95);
  // roof
  s.lineTo(-0.85, 1.05);
  // hatch / fastback
  s.lineTo(-1.55, 0.88);
  s.lineTo(-1.85, 0.55);
  // rear bumper
  s.lineTo(-2.05, 0.38);
  s.lineTo(-2.1, 0.18);
  s.lineTo(-2.1, 0.08);
  // rocker back to front (wheel arches as simple indents)
  s.lineTo(-1.35, 0.08);
  s.lineTo(-1.35, 0.28);
  s.absarc(-1.05, 0.08, 0.32, Math.PI, 0, true);
  s.lineTo(0.75, 0.08);
  s.lineTo(0.75, 0.28);
  s.absarc(1.1, 0.08, 0.32, Math.PI, 0, true);
  s.lineTo(2.15, 0.08);
  return s;
}

function extrudeShape(
  shape: THREE.Shape,
  depth: number,
  mat: THREE.Material,
  name: string
): THREE.Mesh {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.015,
    bevelSegments: 2,
    curveSegments: 12,
  });
  geo.center();
  // Extrude goes along +Z; rotate so length is X and width is Z
  geo.rotateY(Math.PI / 2);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  return mesh;
}

function box(
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  name: string,
  x = 0,
  y = 0,
  z = 0
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.name = name;
  return m;
}

function wheel(name: string, x: number, z: number) {
  const g = new THREE.Group();
  g.name = name;
  const tire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.33, 0.33, 0.24, 28),
    darkMat()
  );
  tire.rotation.z = Math.PI / 2;
  tire.name = `${name}_Tire`;
  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.26, 16),
    chromeMat()
  );
  rim.rotation.z = Math.PI / 2;
  rim.name = `${name}_Rim`;
  g.add(tire, rim);
  g.position.set(x, 0.0, z);
  return g;
}

function buildCar(): THREE.Group {
  const root = new THREE.Group();
  root.name = "FordMustangGT_Foxbody_1990";

  const paint = paintMat();
  const dark = darkMat();
  const chrome = chromeMat();
  const glass = glassMat();
  const leather = leatherMat();
  const eng = engineMat();

  // Main body from silhouette (width ~1.4m)
  const body = extrudeShape(foxSideShape(), 1.35, paint, "Body");
  body.position.set(0, 0.42, 0);
  // Re-center vertically roughly
  body.position.y = 0.45;
  root.add(body);

  // Cabin greenhouse
  const cabinShape = new THREE.Shape();
  cabinShape.moveTo(0.2, 0.55);
  cabinShape.lineTo(0.05, 0.95);
  cabinShape.lineTo(-0.85, 1.02);
  cabinShape.lineTo(-1.45, 0.85);
  cabinShape.lineTo(-1.35, 0.55);
  cabinShape.lineTo(0.2, 0.55);
  const cabin = extrudeShape(cabinShape, 1.15, paint, "Cabin");
  cabin.position.set(-0.35, 0.55, 0);
  root.add(cabin);

  const windshield = box(0.06, 0.48, 1.05, glass, "Windshield", 0.22, 0.82, 0);
  windshield.rotation.z = -0.42;
  root.add(windshield);

  // Hood (pivot at rear of hood)
  const hoodPivot = new THREE.Group();
  hoodPivot.name = "HoodPivot";
  hoodPivot.position.set(0.45, 0.54, 0);
  const hood = box(1.55, 0.05, 1.28, paint, "Hood", 0.78, 0, 0);
  hoodPivot.add(hood);
  // GT dual scoops
  hoodPivot.add(box(0.45, 0.04, 0.22, dark, "ScoopL", 0.55, 0.04, 0.28));
  hoodPivot.add(box(0.45, 0.04, 0.22, dark, "ScoopR", 0.55, 0.04, -0.28));
  root.add(hoodPivot);

  // Engine under hood
  const engine = new THREE.Group();
  engine.name = "Engine";
  engine.position.set(1.15, 0.28, 0);
  engine.add(box(0.75, 0.36, 0.65, eng, "EngineBlock", 0, 0, 0));
  engine.add(box(0.55, 0.08, 0.5, chrome, "ValveCover", 0, 0.2, 0));
  engine.add(box(0.1, 0.28, 0.1, chrome, "Intake", 0, 0.3, 0));
  root.add(engine);

  // Doors
  function makeDoor(side: 1 | -1, name: string) {
    const pivot = new THREE.Group();
    pivot.name = `${name}Pivot`;
    pivot.position.set(0.05, 0.38, side * 0.68);
    const panel = box(1.15, 0.55, 0.07, paint, name, 0.35, 0, side * 0.02);
    const win = box(0.7, 0.28, 0.04, glass, `${name}Window`, 0.25, 0.28, side * 0.02);
    pivot.add(panel, win);
    root.add(pivot);
    return pivot;
  }
  makeDoor(1, "DoorL");
  makeDoor(-1, "DoorR");

  // Interior
  const interior = new THREE.Group();
  interior.name = "Interior";
  interior.position.set(-0.35, 0.35, 0);
  interior.add(box(1.05, 0.08, 1.05, leather, "Floor", 0, 0, 0));
  interior.add(box(0.36, 0.34, 0.38, leather, "SeatL", 0.05, 0.2, 0.3));
  interior.add(box(0.36, 0.34, 0.38, leather, "SeatR", 0.05, 0.2, -0.3));
  interior.add(box(0.08, 0.26, 0.08, chrome, "SteeringCol", 0.48, 0.26, 0.28));
  interior.add(box(0.42, 0.06, 0.4, dark, "Dash", 0.45, 0.16, 0));
  root.add(interior);

  // Front quad lights (1987–92 style)
  root.add(box(0.08, 0.14, 0.2, chrome, "HeadL_Outer", 2.0, 0.38, 0.42));
  root.add(box(0.08, 0.14, 0.2, chrome, "HeadR_Outer", 2.0, 0.38, -0.42));
  root.add(box(0.08, 0.12, 0.16, chrome, "HeadL_Inner", 2.0, 0.36, 0.2));
  root.add(box(0.08, 0.12, 0.16, chrome, "HeadR_Inner", 2.0, 0.36, -0.2));
  root.add(box(0.35, 0.08, 1.1, dark, "Grille", 2.02, 0.28, 0));

  // Rear
  root.add(box(0.08, 0.12, 0.95, chrome, "TailLights", -2.02, 0.42, 0));
  root.add(box(0.2, 0.08, 0.55, dark, "RearBumper", -2.08, 0.18, 0));

  // Side GT scoops
  root.add(box(0.35, 0.12, 0.06, dark, "SideScoopL", 0.55, 0.35, 0.7));
  root.add(box(0.35, 0.12, 0.06, dark, "SideScoopR", 0.55, 0.35, -0.7));

  // Wheels
  root.add(wheel("WheelFL", 1.15, 0.72));
  root.add(wheel("WheelFR", 1.15, -0.72));
  root.add(wheel("WheelRL", -1.05, 0.72));
  root.add(wheel("WheelRR", -1.05, -0.72));

  return root;
}

async function main() {
  const car = buildCar();
  const exporter = new GLTFExporter();
  const result = await exporter.parseAsync(car, {
    binary: true,
    onlyVisible: true,
  });
  mkdirSync(dirname(outPath), { recursive: true });
  const buf = Buffer.from(result as ArrayBuffer);
  writeFileSync(outPath, buf);
  console.log("wrote", outPath, buf.length, "bytes");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
