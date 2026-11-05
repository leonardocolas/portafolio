import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type LayerKey = 'frontend' | 'backend' | 'database';
type Props = {
  labels: Record<LayerKey, string>;
  language: 'es' | 'en';
};

const layerPositions: Record<LayerKey, THREE.Vector3> = {
  frontend: new THREE.Vector3(0, 1.18, 0.04),
  backend: new THREE.Vector3(-1.02, -0.47, 0.1),
  database: new THREE.Vector3(1.02, -0.47, -0.04),
};

export default function ArchitectureScene({ labels, language }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderOnceRef = useRef<(() => void) | null>(null);
  const selectionRef = useRef<LayerKey>('frontend');
  const [activeLayer, setActiveLayer] = useState<LayerKey>('frontend');
  const [webglAvailable, setWebglAvailable] = useState(true);
  const layerOptions: LayerKey[] = ['frontend', 'backend', 'database'];

  useEffect(() => {
    selectionRef.current = activeLayer;
    renderOnceRef.current?.();
  }, [activeLayer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      setWebglAvailable(false);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 7.1);
    const root = new THREE.Group();
    scene.add(root);
    const core = new THREE.Group();
    root.add(core);
    const mint = new THREE.Color('#88d7be');
    const ocean = new THREE.Color('#537f9b');
    const nodes = new Map<LayerKey, THREE.Mesh>();

    const wireMaterial = new THREE.MeshBasicMaterial({ color: '#b7cac1', wireframe: true, transparent: true, opacity: 0.73 });
    core.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.57, 1), wireMaterial));

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.42, 0.008, 4, 120),
      new THREE.MeshBasicMaterial({ color: '#9bcfc0', transparent: true, opacity: 0.46 }),
    );
    halo.rotation.x = Math.PI * 0.33;
    root.add(halo);
    const halo2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.73, 0.005, 4, 100),
      new THREE.MeshBasicMaterial({ color: '#bacac2', transparent: true, opacity: 0.4 }),
    );
    halo2.rotation.set(0.85, 0.45, 0.25);
    root.add(halo2);

    const links = new THREE.Group();
    root.add(links);
    for (const key of layerOptions) {
      const points = [layerPositions[key], new THREE.Vector3(0, 0, 0)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      links.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#88aa9e', transparent: true, opacity: 0.43 })));
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.105, 24, 16),
        new THREE.MeshBasicMaterial({ color: key === 'frontend' ? mint : ocean, transparent: true, opacity: 0.91 }),
      );
      dot.position.copy(layerPositions[key]);
      dot.userData.layer = key;
      root.add(dot);
      nodes.set(key, dot);
      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(0.19, 0.004, 4, 40),
        new THREE.MeshBasicMaterial({ color: '#a9c2b8', transparent: true, opacity: 0.62 }),
      );
      orbit.position.copy(layerPositions[key]);
      orbit.rotation.x = 0.7;
      root.add(orbit);
    }

    const starsGeometry = new THREE.BufferGeometry();
    const stars: number[] = [];
    let seed = 157;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 90; i += 1) stars.push((random() - 0.5) * 5.4, (random() - 0.5) * 4.5, (random() - 0.5) * 1.6 - 0.9);
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
    const starPoints = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: '#94ab9f', size: 0.015, transparent: true, opacity: 0.63 }));
    root.add(starPoints);

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const paintSelection = () => {
      for (const [key, node] of nodes) {
        const selected = selectionRef.current === key;
        const material = node.material as THREE.MeshBasicMaterial;
        material.color.set(selected ? mint : ocean);
        node.scale.setScalar(selected ? 1.13 : 0.88);
      }
    };
    const draw = () => {
      paintSelection();
      renderer.render(scene, camera);
    };
    renderOnceRef.current = draw;
    const size = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.position.z = rect.width < 480 ? 8.5 : 7.1;
      camera.updateProjectionMatrix();
      draw();
    };
    const resize = new ResizeObserver(size);
    resize.observe(canvas);
    size();

    let frame = 0;
    let elapsed = 0;
    let last = 0;
    const animate = (now: number) => {
      frame = requestAnimationFrame(animate);
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!media.matches) elapsed += delta;
      if (!media.matches) {
        core.rotation.y = elapsed * 0.075;
        halo.rotation.z = elapsed * 0.052;
        halo2.rotation.y = 0.16 + Math.sin(elapsed * 0.13) * 0.08;
        root.position.y = Math.sin(elapsed * 0.22) * 0.025;
        for (const [key, node] of nodes) {
          const selected = selectionRef.current === key;
          const mat = node.material as THREE.MeshBasicMaterial;
          mat.color.lerp(selected ? mint : ocean, 0.035);
          node.scale.setScalar(selected ? 1.13 : 0.88);
        }
      }
      renderer.render(scene, camera);
    };
    if (!media.matches) frame = requestAnimationFrame(animate);

    let dragging = false;
    let previousX = 0;
    let previousY = 0;
    const onDown = (event: PointerEvent) => {
      dragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
      canvas.classList.add('is-dragging');
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      root.rotation.y += (event.clientX - previousX) * 0.008;
      root.rotation.x = THREE.MathUtils.clamp(root.rotation.x + (event.clientY - previousY) * 0.005, -0.5, 0.5);
      previousX = event.clientX;
      previousY = event.clientY;
      if (media.matches) draw();
    };
    const onUp = () => { dragging = false; canvas.classList.remove('is-dragging'); };
    const onReducedMotion = () => {
      cancelAnimationFrame(frame);
      if (!media.matches) {
        last = 0;
        frame = requestAnimationFrame(animate);
      } else {
        draw();
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    media.addEventListener('change', onReducedMotion);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      media.removeEventListener('change', onReducedMotion);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderOnceRef.current = null;
    };
  }, []);

  return (
    <div className="architecture-stage" role="group" aria-label={language === 'es' ? 'Diagrama tridimensional interactivo de capas de software' : 'Interactive three-dimensional software layer diagram'}>
      {webglAvailable ? <canvas ref={canvasRef} className="architecture-canvas" aria-hidden="true" /> : <FallbackDiagram labels={labels} />}
      <div className="architecture-center-label" aria-hidden="true"><span>FULL</span><span>STACK</span></div>
      <div className="architecture-labels">
        {layerOptions.map((key) => <button className={`architecture-node-label node-${key} ${activeLayer === key ? 'active' : ''}`} type="button" key={key} aria-pressed={activeLayer === key} onClick={() => setActiveLayer(key)}><span className="node-label-dot" />{labels[key]}</button>)}
      </div>
    </div>
  );
}

function FallbackDiagram({ labels }: { labels: Props['labels'] }) {
  return <svg className="architecture-fallback" viewBox="0 0 500 390" role="img" aria-label={`${labels.frontend}, ${labels.backend}, ${labels.database}`}>
    <circle cx="250" cy="192" r="128" fill="none" stroke="#a6c9bb" strokeDasharray="2 7" />
    <circle cx="250" cy="192" r="94" fill="none" stroke="#b5c8c0" />
    <path d="M250 68 L140 270 L360 270 Z" fill="none" stroke="#a5b8ae" />
    <circle cx="250" cy="68" r="10" fill="#88d7be" /><circle cx="140" cy="270" r="10" fill="#537f9b" /><circle cx="360" cy="270" r="10" fill="#537f9b" />
    <text x="250" y="47" textAnchor="middle">{labels.frontend}</text><text x="116" y="300" textAnchor="middle">{labels.backend}</text><text x="385" y="300" textAnchor="middle">{labels.database}</text>
  </svg>;
}
