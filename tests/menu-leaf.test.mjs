import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../public/vendor/three.module.js";

import { createBookLeaf, getTurnPlan } from "../public/js/book-leaf.js";
function createLeaf() {
  return createBookLeaf({ width: 2.35, height: 3.5 });
}

test("paper faces have physical separation instead of occupying the same plane", async () => {
  const leaf = await createLeaf();
  const front = leaf.front.geometry.attributes.position;
  const back = leaf.back.geometry.attributes.position;
  const point = new THREE.Vector3(),
    other = new THREE.Vector3();
  for (const index of [0, Math.floor(front.count / 2), front.count - 1]) {
    point.fromBufferAttribute(front, index);
    other.fromBufferAttribute(back, index);
    assert.ok(
      point.distanceTo(other) >= 0.009,
      "Coplanar front/back faces can bleed through each other.",
    );
  }
});

test("reverse-side UVs are flipped so the artwork is not mirrored after the turn", async () => {
  const leaf = await createLeaf();
  const front = leaf.front.geometry.attributes.uv;
  const back = leaf.back.geometry.attributes.uv;
  for (const index of [0, Math.floor(front.count / 2), front.count - 1]) {
    assert.ok(
      Math.abs(back.getX(index) - (1 - front.getX(index))) < 1e-6,
      "The reverse surface must use its own reading orientation.",
    );
  }
});

test("forward and reverse turns keep the correct pages underneath the moving sheet", async () => {
  assert.equal(typeof getTurnPlan, "function");
  assert.deepEqual(getTurnPlan(1, 1, 4), {
    target: 2,
    front: 1,
    back: 2,
    underLeft: 1,
    underRight: 2,
    start: 0,
  });
  assert.deepEqual(getTurnPlan(2, -1, 4), {
    target: 1,
    front: 1,
    back: 2,
    underLeft: 1,
    underRight: 2,
    start: 1,
  });
  assert.equal(getTurnPlan(0, -1, 4), null);
  assert.equal(getTurnPlan(3, 1, 4), null);
});

test("the entire curl stays opaque and finite with separated faces at every angle", () => {
  const leaf = createLeaf();
  assert.equal(leaf.front.material.transparent, false);
  assert.equal(leaf.back.material.transparent, false);
  assert.equal(leaf.front.material.depthWrite, true);
  assert.equal(leaf.back.material.depthWrite, true);
  assert.equal(leaf.front.receiveShadow, false);
  assert.equal(leaf.back.receiveShadow, false);
  for (let frame = 0; frame <= 40; frame++) {
    leaf.update(frame / 40);
    const a = leaf.front.geometry.attributes.position,
      b = leaf.back.geometry.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const distance = Math.hypot(
        a.getX(i) - b.getX(i),
        a.getY(i) - b.getY(i),
        a.getZ(i) - b.getZ(i),
      );
      assert.ok(
        Number.isFinite(distance) && distance > 0.0119 && distance < 0.0121,
      );
    }
    assert.ok(
      [...leaf.edge.geometry.attributes.position.array].every(Number.isFinite),
    );
  }
});
