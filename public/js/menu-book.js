import * as THREE from "../vendor/three.module.js";
import { createBookLeaf, getTurnPlan, restHeight } from "./book-leaf.js";
const stage = document.querySelector("#book-stage"),
  prev = document.querySelector("#book-prev"),
  next = document.querySelector("#book-next"),
  count = document.querySelector("#book-count"),
  desc = document.querySelector("#book-description"),
  fallbackTitle = document.querySelector("#fallback-title"),
  fallbackItems = document.querySelector("#fallback-items");
const pages = [
  {
    title: "Biryani",
    items: ["Mutton Biryani", "Chicken Biryani", "Kebabs"],
    photos: ["biryani", "biryani", "kebabs"],
  },
  {
    title: "Kebabs",
    items: ["Chicken Tikka Kabab", "Chicken Reshmi Kabab", "Kebab Platter"],
    photos: ["kebabs", "kebabs", "kebabs"],
  },
  {
    title: "The wider table",
    items: ["Mughlai favourites", "Indo-Chinese dishes", "Biryani & rice"],
    photos: ["kebabs", "kebabs", "biryani"],
  },
  {
    title: "At Sufi Palace",
    items: [
      "Explore the full menu",
      "Visit College Street",
      "Ask us about catering",
    ],
    photos: ["biryani", "store", "kebabs"],
  },
];
const W = 2.35,
  H = 3.5;
let current = 0,
  turning = false,
  renderer,
  scene,
  camera,
  book,
  leftPage,
  rightPage,
  leaf,
  artTexture,
  textures = [],
  chapterTextures = [],
  direction = 1,
  started = 0,
  raf = 0;
let cameraDistance = 10,
  scrollFrame = 0,
  menuVisible = true;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const photos = {};
function updateText() {
  const p = pages[current];
  count.textContent = `0${current + 1} / 04`;
  prev.disabled = current === 0;
  next.disabled = current === pages.length - 1;
  prev.setAttribute("aria-disabled", String(turning || prev.disabled));
  next.setAttribute("aria-disabled", String(turning || next.disabled));
  stage.setAttribute("aria-busy", String(turning));
  document.querySelector("#book-category")?.replaceChildren(p.title);
  desc.textContent = `Menu page ${current + 1}: ${p.title}. ${p.items.join(", ")}`;
  fallbackTitle.textContent = p.title;
  fallbackItems.replaceChildren(
    ...p.items.map((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      return li;
    }),
  );
}
updateText();
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
}
function texture(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer
    ? Math.min(8, renderer.capabilities.getMaxAnisotropy())
    : 4;
  return t;
}
function ornament(c, x, y, scale = 1) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  c.strokeStyle = "#b88b4d";
  c.lineWidth = 1.4;
  for (let k = 0; k < 8; k++) {
    c.rotate(Math.PI / 4);
    c.beginPath();
    c.ellipse(0, 12, 4, 12, 0, 0, Math.PI * 2);
    c.stroke();
  }
  c.beginPath();
  c.arc(0, 0, 4, 0, 7);
  c.stroke();
  c.restore();
}
function pageTexture(p) {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1500;
  const c = canvas.getContext("2d");
  c.fillStyle = "#f3dfbd";
  c.fillRect(0, 0, 1000, 1500);
  const g = c.createLinearGradient(0, 0, 1000, 0);
  g.addColorStop(0, "#b9a080");
  g.addColorStop(0.07, "#e5cda9");
  g.addColorStop(0.2, "#f5e6cb");
  g.addColorStop(0.8, "#f0dab7");
  g.addColorStop(1, "#dac09a");
  c.fillStyle = g;
  c.fillRect(0, 0, 1000, 1500);
  let seed = 71;
  for (let k = 0; k < 18000; k++) {
    seed = (seed * 16807) % 2147483647;
    const x = seed % 1000;
    seed = (seed * 16807) % 2147483647;
    const y = seed % 1500;
    c.fillStyle = k % 2 ? "#653f2410" : "#ffffff25";
    c.fillRect(x, y, 1, 1);
  }
  c.strokeStyle = "#b98b52";
  c.lineWidth = 2;
  c.strokeRect(35, 35, 930, 1430);
  c.strokeRect(48, 48, 904, 1404);
  ornament(c, 500, 104, 1.4);
  [
    [83, 90],
    [917, 90],
    [83, 1405],
    [917, 1405],
  ].forEach(([x, y]) => ornament(c, x, y, 0.8));
  c.textAlign = "center";
  c.fillStyle = "#48211a";
  c.font = "92px Georgia";
  c.fillText(p.title, 500, 270);
  c.strokeStyle = "#b88c55";
  c.beginPath();
  c.moveTo(280, 310);
  c.lineTo(720, 310);
  c.stroke();
  p.items.forEach((item, i) => {
    const cy = 465 + i * 305;
    const img = photos[p.photos[i]];
    c.save();
    c.beginPath();
    c.ellipse(266, cy, 150, 104, 0, 0, 7);
    c.clip();
    if (img) {
      const scale = Math.max(300 / img.width, 208 / img.height);
      c.drawImage(
        img,
        266 - (img.width * scale) / 2,
        cy - (img.height * scale) / 2,
        img.width * scale,
        img.height * scale,
      );
    }
    c.restore();
    c.strokeStyle = "#b78a50";
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(266, cy, 150, 104, 0, 0, 7);
    c.stroke();
    c.fillStyle = "#563123";
    c.font = "38px Georgia";
    c.textAlign = "left";
    const words = item.split(" ");
    let lines = [""];
    for (const word of words) {
      let idx = lines.length - 1;
      if (c.measureText(lines[idx] + word).width > 390) lines.push(word + " ");
      else lines[idx] += word + " ";
    }
    lines.forEach((line, j) =>
      c.fillText(line.trim(), 460, cy + (j - (lines.length - 1) / 2) * 48 + 9),
    );
    c.beginPath();
    c.moveTo(460, cy + 65);
    c.lineTo(840, cy + 65);
    c.stroke();
    ornament(c, 650, cy + 65, 0.45);
  });
  c.textAlign = "center";
  c.fillStyle = "#9b7954";
  c.font = "21px Georgia";
  c.fillText("Please confirm current availability and prices", 500, 1390);
  return texture(canvas);
}
function noiseTexture(marble = false) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const x = c.getContext("2d");
  x.fillStyle = marble ? "#53392f" : "#451317";
  x.fillRect(0, 0, 512, 512);
  let seed = 18;
  for (let k = 0; k < 18000; k++) {
    seed = (seed * 16807) % 2147483647;
    let a = seed % 512;
    seed = (seed * 16807) % 2147483647;
    let b = seed % 512;
    x.fillStyle = k % 2 ? "#ffffff10" : "#00000018";
    x.fillRect(a, b, 2, 2);
  }
  if (marble) {
    x.lineWidth = 0.8;
    for (let j = 0; j < 20; j++) {
      x.strokeStyle = j % 2 ? "#e6d0aa66" : "#d0a17033";
      x.beginPath();
      x.moveTo(-30, j * 35);
      x.bezierCurveTo(170, j * 35 - 100, 240, j * 35 + 90, 560, j * 35 - 40);
      x.stroke();
    }
  }
  return texture(c);
}
function pageGeo(side) {
  const g = new THREE.PlaneGeometry(W, H, 64, 8);
  g.translate((side * W) / 2, 0, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++)
    p.setZ(i, restHeight(Math.abs(p.getX(i)) / W));
  g.computeVertexNormals();
  return g;
}
function chapterTexture(image, index) {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1500;
  const c = canvas.getContext("2d");
  c.drawImage(image, 0, 0, 1000, 1500);
  // A wordless gold seal keeps the reverse decorative throughout the turn.
  c.fillStyle = "#3c111b";
  c.beginPath();
  c.arc(500, 1375, 45, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "#dfbe7e";
  c.lineWidth = 2;
  c.beginPath();
  c.arc(500, 1375, 39, 0, Math.PI * 2);
  c.stroke();
  c.save();
  c.translate(500, 1375);
  c.rotate((index * Math.PI) / 8);
  for (let petal = 0; petal < 8; petal++) {
    c.rotate(Math.PI / 4);
    c.beginPath();
    c.ellipse(0, 14, 5, 12, 0, 0, Math.PI * 2);
    c.stroke();
  }
  c.restore();
  return texture(canvas);
}
function render() {
  if (renderer) renderer.render(scene, camera);
}
function createBox(w, h, d, material, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function addLantern(x) {
  const lantern = new THREE.Group();
  lantern.position.set(x, -1.9, 0.35);
  const brass = new THREE.MeshStandardMaterial({
    color: 0xb58a45,
    metalness: 0.72,
    roughness: 0.32,
  });
  const glow = new THREE.MeshStandardMaterial({
    color: 0xffdd99,
    emissive: 0xffb34b,
    emissiveIntensity: 0.65,
    roughness: 0.5,
  });
  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.16, 0.025),
    new THREE.Vector2(0.17, 0.06),
    new THREE.Vector2(0.12, 0.1),
  ];
  const base = new THREE.Mesh(new THREE.LatheGeometry(profile, 24), brass);
  lantern.add(base);
  const light = new THREE.Mesh(
    new THREE.CylinderGeometry(0.105, 0.125, 0.28, 8),
    glow,
  );
  light.position.y = 0.25;
  lantern.add(light);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rib = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.33, 5),
      brass,
    );
    rib.position.set(Math.cos(a) * 0.128, 0.26, Math.sin(a) * 0.128);
    lantern.add(rib);
  }
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.175, 0.16, 8), brass);
  roof.position.y = 0.48;
  lantern.add(roof);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.055, 0.009, 6, 20),
    brass,
  );
  ring.position.y = 0.6;
  lantern.add(ring);
  const pool = new THREE.PointLight(0xffc27d, 0.3, 1.25, 2);
  pool.position.set(0, 0.28, 0.12);
  lantern.add(pool);
  scene.add(lantern);
}
function updateCameraFromScroll() {
  scrollFrame = 0;
  if (!renderer || !camera || !menuVisible) return;
  const rect = stage.getBoundingClientRect();
  const progress = Math.max(
    -1,
    Math.min(1, (innerHeight / 2 - rect.top - rect.height / 2) / innerHeight),
  );
  camera.position.set(
    0.15 + (reduce ? 0 : progress * 0.1),
    0.35 + (reduce ? 0 : progress * 0.12),
    cameraDistance,
  );
  camera.lookAt(0, -0.15, 0);
  render();
}
function requestScrollRender() {
  if (!reduce && !scrollFrame && menuVisible)
    scrollFrame = requestAnimationFrame(updateCameraFromScroll);
}
async function init() {
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.appendChild(renderer.domElement);
    renderer.domElement.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      cancelAnimationFrame(raf);
      renderer?.domElement.remove();
      renderer = null;
      scene = null;
      turning = false;
      stage.classList.remove("ready", "turning");
      updateText();
    });
    const images = await Promise.all([
      loadImage("assets/backgrounds/book-art-page.webp"),
      loadImage("assets/food/biryani.png"),
      loadImage("assets/food/kebabs.png"),
      loadImage("assets/photos/storefront.webp"),
    ]);
    if (!renderer) return;
    photos.biryani = images[1];
    photos.kebabs = images[2];
    photos.store = images[3];
    chapterTextures = pages.map((_, index) => chapterTexture(images[0], index));
    artTexture = chapterTextures[0];
    textures = pages.map(pageTexture);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    scene.add(new THREE.HemisphereLight(0xfff4df, 0x321015, 1.65));
    const key = new THREE.DirectionalLight(0xfff1da, 2.2);
    key.position.set(-4, 6, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, {
      left: -6,
      right: 6,
      top: 6,
      bottom: -6,
      near: 0.1,
      far: 25,
    });
    key.shadow.bias = -0.00006;
    key.shadow.normalBias = 0.004;
    key.shadow.radius = 4;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffd9aa, 0.65);
    fill.position.set(4, 1, 3);
    scene.add(fill);
    const marble = new THREE.MeshPhysicalMaterial({
      map: noiseTexture(true),
      roughness: 0.26,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25,
      color: 0xf1e1ce,
    });
    createBox(5.7, 0.22, 2.0, marble, 0, -2.02, -0.1);
    const bronze = new THREE.MeshStandardMaterial({
      color: 0x9b6b32,
      metalness: 0.7,
      roughness: 0.35,
    });
    createBox(5.72, 0.022, 0.025, bronze, 0, -1.9, 0.91);
    const wood = new THREE.MeshStandardMaterial({
      map: noiseTexture(),
      color: 0x731f22,
      roughness: 0.6,
    });
    createBox(4.95, 0.11, 0.58, wood, 0, -1.81, -0.18);
    createBox(4.95, 0.04, 0.06, bronze, 0, -1.74, 0.12);
    addLantern(-2.64);
    addLantern(2.64);
    const backStand = createBox(4.55, 1.9, 0.11, wood, 0, -0.8, -0.44);
    backStand.rotation.x = -0.12;
    book = new THREE.Group();
    book.position.y = 0.02;
    book.rotation.x = -0.13;
    book.rotation.y = -0.09;
    scene.add(book);
    for (const side of [-1, 1]) {
      const wing = new THREE.Group();
      // Page surfaces share the same rest profile as the moving leaf.
      book.add(wing);
      const cover = createBox(
        W + 0.13,
        H + 0.15,
        0.11,
        wood,
        side * (W / 2 + 0.015),
        0,
        -0.13,
        wing,
      );
      createBox(
        W + 0.09,
        H + 0.1,
        0.025,
        bronze,
        side * (W / 2 + 0.015),
        0,
        -0.062,
        wing,
      );
      const paper = new THREE.MeshStandardMaterial({
        color: 0xd7bd96,
        roughness: 0.98,
      });
      createBox(W, H, 0.13, paper, (side * W) / 2, 0, -0.015, wing);
      for (let k = 0; k < 9; k++) {
        const line = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(W, H, 0.001)),
          new THREE.LineBasicMaterial({
            color: k % 2 ? 0xb99d77 : 0xead6b3,
            transparent: true,
            opacity: 0.7,
          }),
        );
        line.position.set((side * W) / 2, 0, -0.06 + k * 0.014);
        wing.add(line);
      }
      const pg = new THREE.Mesh(
        pageGeo(side),
        new THREE.MeshStandardMaterial({
          map: side < 0 ? artTexture : textures[0],
          roughness: 0.95,
          side: THREE.FrontSide,
        }),
      );
      pg.position.z = 0.08;
      pg.castShadow = true;
      pg.receiveShadow = true;
      wing.add(pg);
      if (side < 0) leftPage = pg;
      else rightPage = pg;
    }
    leaf = createBookLeaf({
      width: W,
      height: H,
      frontMap: textures[0],
      backMap: chapterTextures[0],
    });
    leaf.group.position.z = 0.08;
    leaf.group.visible = false;
    book.add(leaf.group);
    stage.classList.add("ready");
    function resize() {
      if (!renderer) return;
      const w = stage.clientWidth,
        h = stage.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const dist = Math.max(
        4.45 / (2 * Math.tan(Math.PI / 10)),
        5.9 / (2 * Math.tan(Math.PI / 10) * camera.aspect),
      );
      cameraDistance = dist;
      camera.position.set(0.15, 0.35, dist);
      camera.lookAt(0, -0.15, 0);
      camera.updateProjectionMatrix();
      render();
    }
    new ResizeObserver(resize).observe(stage);
    resize();
    settle();
    window.addEventListener("scroll", requestScrollRender, { passive: true });
    new IntersectionObserver(
      ([entry]) => {
        menuVisible = entry.isIntersecting;
        if (menuVisible) requestScrollRender();
      },
      { rootMargin: "100px" },
    ).observe(stage);
  } catch (err) {
    console.error("Menu 3D unavailable:", err);
    renderer?.domElement.remove();
    renderer = null;
    scene = null;
    stage.classList.remove("ready");
  }
}
function setMap(mesh, map) {
  mesh.material.map = map;
  mesh.material.needsUpdate = true;
}
function settle() {
  setMap(rightPage, textures[current]);
  setMap(leftPage, chapterTextures[current]);
  render();
}
function turn(dir) {
  const plan = getTurnPlan(current, dir, pages.length);
  if (turning || !plan) return;
  if (!renderer || !scene || reduce) {
    current = plan.target;
    updateText();
    if (scene) settle();
    return;
  }
  turning = true;
  direction = dir;
  started = performance.now();
  setMap(leaf.front, textures[plan.front]);
  setMap(leaf.back, chapterTextures[plan.back]);
  setMap(rightPage, textures[plan.underRight]);
  setMap(leftPage, chapterTextures[plan.underLeft]);
  leaf.update(plan.start);
  leaf.group.visible = true;
  prev.setAttribute("aria-disabled", "true");
  next.setAttribute("aria-disabled", "true");
  stage.setAttribute("aria-busy", "true");
  stage.classList.add("turning");
  raf = requestAnimationFrame(animate);
}
function animate(now) {
  const t = Math.min(1, (now - started) / 1600);
  const eased = t * t * t * (t * (t * 6 - 15) + 10);
  leaf.update(direction > 0 ? eased : 1 - eased);
  render();
  if (t < 1) raf = requestAnimationFrame(animate);
  else {
    current += direction;
    leaf.group.visible = false;
    turning = false;
    stage.classList.remove("turning");
    updateText();
    settle();
  }
}
prev.addEventListener("click", () => turn(-1));
next.addEventListener("click", () => turn(1));
let pointerStart = null;
stage.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || !event.isPrimary) return;
  pointerStart = { x: event.clientX, y: event.clientY };
  stage.setPointerCapture(event.pointerId);
});
stage.addEventListener("pointerup", (event) => {
  if (!pointerStart) return;
  const dx = event.clientX - pointerStart.x,
    dy = event.clientY - pointerStart.y;
  pointerStart = null;
  if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.2)
    turn(dx < 0 ? 1 : -1);
});
stage.addEventListener("pointercancel", () => {
  pointerStart = null;
});
stage.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  turn(event.key === "ArrowRight" ? 1 : -1);
});
const menuLoader = new IntersectionObserver(
  ([entry], observer) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    init();
  },
  { rootMargin: "500px" },
);
menuLoader.observe(stage);
