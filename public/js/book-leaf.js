import * as THREE from "../vendor/three.module.js";

export function getTurnPlan(current, direction, total) {
  const target = current + direction;
  if (![-1, 1].includes(direction) || target < 0 || target >= total)
    return null;
  return {
    target,
    front: direction > 0 ? current : target,
    back: direction > 0 ? target : current,
    underLeft: direction > 0 ? current : target,
    underRight: direction > 0 ? target : current,
    start: direction > 0 ? 0 : 1,
  };
}

export function restHeight(u) {
  return 0.045 + Math.sin(u * Math.PI) * 0.065 - u * 0.045;
}

function sampleCurve(u, progress, width) {
  let x = 0,
    z = 0;
  const steps = 24;
  for (let step = 0; step < steps; step++) {
    const f = (u * (step + 0.5)) / steps;
    const angle =
      Math.PI * progress -
      Math.sin(Math.PI * progress) * Math.sin(f * Math.PI) * 0.52;
    x += (Math.cos(angle) * width * u) / steps;
    z += (Math.sin(angle) * width * u) / steps;
  }
  return { x, z: z + restHeight(u) };
}

// Opaque paper has two separated faces and a stitched perimeter. Neither face is
// drawn twice, and the reverse has independent UVs instead of mirrored text.
export function createBookLeaf({
  width = 2.35,
  height = 3.5,
  frontMap = null,
  backMap = null,
} = {}) {
  const columns = 64,
    rows = 8,
    thickness = 0.012;
  const group = new THREE.Group();
  const frontGeometry = new THREE.PlaneGeometry(width, height, columns, rows);
  frontGeometry.translate(width / 2, 0, 0);
  const backGeometry = frontGeometry.clone();
  const backUV = backGeometry.attributes.uv;
  for (let i = 0; i < backUV.count; i++) backUV.setX(i, 1 - backUV.getX(i));
  const front = new THREE.Mesh(
    frontGeometry,
    new THREE.MeshStandardMaterial({
      map: frontMap,
      color: 0xffffff,
      roughness: 0.94,
      side: THREE.FrontSide,
    }),
  );
  const back = new THREE.Mesh(
    backGeometry,
    new THREE.MeshStandardMaterial({
      map: backMap,
      color: 0xffffff,
      roughness: 0.94,
      side: THREE.BackSide,
    }),
  );
  const perimeter = [];
  for (let col = 0; col <= columns; col++) perimeter.push(col);
  for (let row = 1; row <= rows; row++)
    perimeter.push(row * (columns + 1) + columns);
  for (let col = columns - 1; col >= 0; col--)
    perimeter.push(rows * (columns + 1) + col);
  for (let row = rows - 1; row > 0; row--) perimeter.push(row * (columns + 1));
  const edgeGeometry = new THREE.BufferGeometry();
  edgeGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(perimeter.length * 18), 3),
  );
  const edge = new THREE.Mesh(
    edgeGeometry,
    new THREE.MeshStandardMaterial({
      color: 0xd8bb83,
      roughness: 0.92,
      side: THREE.DoubleSide,
    }),
  );
  for (const mesh of [front, back, edge]) {
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
    group.add(mesh);
  }
  function update(progress) {
    progress = Math.max(0, Math.min(1, progress));
    const samples = [];
    for (let col = 0; col <= columns; col++) {
      const u = col / columns;
      const p = sampleCurve(u, progress, width);
      const before = sampleCurve(Math.max(0, u - 0.001), progress, width);
      const after = sampleCurve(Math.min(1, u + 0.001), progress, width);
      const dx = after.x - before.x,
        dz = after.z - before.z;
      const length = Math.hypot(dx, dz);
      samples.push({ ...p, nx: -dz / length, nz: dx / length });
    }
    const a = frontGeometry.attributes.position,
      b = backGeometry.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const p = samples[i % (columns + 1)];
      a.setX(i, p.x + (p.nx * thickness) / 2);
      a.setZ(i, p.z + (p.nz * thickness) / 2);
      b.setX(i, p.x - (p.nx * thickness) / 2);
      b.setZ(i, p.z - (p.nz * thickness) / 2);
    }
    a.needsUpdate = b.needsUpdate = true;
    frontGeometry.computeVertexNormals();
    backGeometry.computeVertexNormals();
    const positions = edgeGeometry.attributes.position;
    let cursor = 0;
    const add = (source, index) =>
      positions.setXYZ(
        cursor++,
        source.getX(index),
        source.getY(index),
        source.getZ(index),
      );
    for (let i = 0; i < perimeter.length; i++) {
      const first = perimeter[i],
        second = perimeter[(i + 1) % perimeter.length];
      add(a, first);
      add(b, first);
      add(a, second);
      add(b, first);
      add(b, second);
      add(a, second);
    }
    positions.needsUpdate = true;
    edgeGeometry.computeVertexNormals();
  }
  update(0);
  return { group, front, back, edge, update, thickness };
}
