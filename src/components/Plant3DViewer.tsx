import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PlantData } from "../types";
import {
  Rotate3d,
  Layers,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Eye,
  Info,
} from "lucide-react";

interface Plant3DViewerProps {
  plant: PlantData;
}

export const Plant3DViewer: React.FC<Plant3DViewerProps> = ({ plant }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [isWireframe, setIsWireframe] = useState(false);
  const [showVascularVeins, setShowVascularVeins] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);

  const morph = plant.morphology3D;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 320;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1412); // Geometric balance background #0F1412
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 3.8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear previous children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(4, 6, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const secondaryLight = new THREE.DirectionalLight(0x10b981, 0.4);
    secondaryLight.position.set(-4, -2, -2);
    scene.add(secondaryLight);

    // Root Group
    const plantGroup = new THREE.Group();
    scene.add(plantGroup);
    groupRef.current = plantGroup;

    // Build 3D Morphology Geometry
    buildPlantMorphology(plantGroup, plant, isWireframe, showVascularVeins);

    // Grid Helper floor (botanical dissection grid with geometric emerald/slate lines)
    const grid = new THREE.GridHelper(4, 16, 0x10b981, 0x2d3748);
    grid.position.y = -1.2;
    scene.add(grid);

    // Mouse / Touch Interaction variables
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !plantGroup) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      plantGroup.rotation.y += deltaX * 0.008;
      plantGroup.rotation.x += deltaY * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    // Render loop
    const animate = () => {
      if (isAutoRotating && !isDragging && plantGroup) {
        plantGroup.rotation.y += 0.006;
      }

      renderer.render(scene, camera);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0 && camera && renderer) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      domElem.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [plant.id, isWireframe, showVascularVeins, isAutoRotating]);

  function resetView() {
    if (groupRef.current && cameraRef.current) {
      groupRef.current.rotation.set(0, 0, 0);
      cameraRef.current.position.set(0, 1.2, 3.8);
    }
  }

  function zoomIn() {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.max(1.8, cameraRef.current.position.z - 0.4);
    }
  }

  function zoomOut() {
    if (cameraRef.current) {
      cameraRef.current.position.z = Math.min(6.0, cameraRef.current.position.z + 0.4);
    }
  }

  return (
    <div className="flex flex-col rounded-sm bg-[#161C1A] border border-[#2D3748] overflow-hidden shadow-lg text-[#E2E8F0]">
      {/* Viewer Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111614] border-b border-[#2D3748]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Rotate3d className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-emerald-400 font-mono">
              3D-ibility & Morphological Dissection
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              Model: {morph.modelType} • Venation: {morph.venationPattern || "Reticulate"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm border transition-colors cursor-pointer ${
              isAutoRotating
                ? "bg-emerald-500 text-black border-emerald-400 font-bold"
                : "bg-[#1A2220] border-[#2D3748] text-slate-400"
            }`}
            title="Toggle Auto-Rotation"
          >
            {isAutoRotating ? "Rotating" : "Paused"}
          </button>
        </div>
      </div>

      {/* 3D Canvas Stage */}
      <div className="relative w-full h-80 bg-[#0F1412] select-none touch-none">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating Tool Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-[#161C1A]/90 backdrop-blur-md p-1.5 rounded-sm border border-[#2D3748] text-slate-300 shadow-md">
          <button
            onClick={zoomIn}
            className="p-1.5 hover:bg-[#242f2c] rounded-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="p-1.5 hover:bg-[#242f2c] rounded-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px bg-[#2D3748] my-0.5" />
          <button
            onClick={() => setIsWireframe(!isWireframe)}
            className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
              isWireframe
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "hover:bg-[#242f2c] text-slate-400"
            }`}
            title="Toggle Morphological Wireframe"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowVascularVeins(!showVascularVeins)}
            className={`p-1.5 rounded-sm transition-colors cursor-pointer ${
              showVascularVeins
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "hover:bg-[#242f2c] text-slate-400"
            }`}
            title="Toggle Vascular Vein Mapping"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 hover:bg-[#242f2c] rounded-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reset Perspective"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Anatomical Highlights Pill */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
          <button
            onClick={() =>
              setActiveAnnotation(
                activeAnnotation === "apex"
                  ? null
                  : `Apex: ${morph.leafApex || "Acute/Acuminate"} tip structure optimized for rapid dew drainage.`
              )
            }
            className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm bg-[#161C1A]/95 border border-[#2D3748] backdrop-blur-sm text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Leaf Apex: {morph.leafApex || "Acute"}
          </button>
          <button
            onClick={() =>
              setActiveAnnotation(
                activeAnnotation === "base"
                  ? null
                  : `Base: ${morph.leafBase || "Cordate/Cuneate"} structural anchoring.`
              )
            }
            className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm bg-[#161C1A]/95 border border-[#2D3748] backdrop-blur-sm text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Base: {morph.leafBase || "Cordate"}
          </button>
          <button
            onClick={() =>
              setActiveAnnotation(
                activeAnnotation === "margin"
                  ? null
                  : `Margin: ${morph.serration ? "Dentate/Serrate toothed margin" : "Entire smooth margin"}.`
              )
            }
            className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm bg-[#161C1A]/95 border border-[#2D3748] backdrop-blur-sm text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Margin: {morph.serration ? "Serrate" : "Entire"}
          </button>
        </div>
      </div>

      {/* Active Annotation Card */}
      {activeAnnotation && (
        <div className="px-4 py-2.5 bg-emerald-950/40 border-t border-emerald-900/50 text-emerald-200 text-xs flex items-center gap-2 font-mono">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{activeAnnotation}</span>
        </div>
      )}

      {/* Dissection Details Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#111614] border-t border-[#2D3748] text-xs">
        <div className="p-2.5 rounded-sm bg-[#161C1A] border border-[#2D3748]">
          <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">
            Leaf Form
          </span>
          <span className="font-semibold text-slate-200">{plant.botanicalDescription.leafShape}</span>
        </div>

        <div className="p-2.5 rounded-sm bg-[#161C1A] border border-[#2D3748]">
          <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">
            Venation Pattern
          </span>
          <span className="font-semibold text-emerald-400 font-mono">{plant.botanicalDescription.venation}</span>
        </div>

        <div className="p-2.5 rounded-sm bg-[#161C1A] border border-[#2D3748]">
          <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">
            Inflorescence
          </span>
          <span className="font-semibold text-amber-300">{plant.botanicalDescription.flowerColor}</span>
        </div>

        <div className="p-2.5 rounded-sm bg-[#161C1A] border border-[#2D3748]">
          <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">
            Stem & Habit
          </span>
          <span className="font-semibold text-slate-200">{plant.botanicalDescription.heightRange}</span>
        </div>
      </div>
    </div>
  );
};

// Helper: Build procedural 3D botanical mesh structures
function buildPlantMorphology(
  parentGroup: THREE.Group,
  plant: PlantData,
  isWireframe: boolean,
  showVeins: boolean
) {
  const morph = plant.morphology3D;
  const leafColor = new THREE.Color(morph.leafColor || "#22c55e");
  const stemColor = new THREE.Color(morph.stemColor || "#854d0e");
  const flowerColor = new THREE.Color(morph.flowerColor || "#f43f5e");

  const leafMaterial = new THREE.MeshStandardMaterial({
    color: leafColor,
    roughness: morph.textureType === "glossy" ? 0.2 : 0.6,
    metalness: 0.1,
    side: THREE.DoubleSide,
    wireframe: isWireframe,
  });

  const stemMaterial = new THREE.MeshStandardMaterial({
    color: stemColor,
    roughness: 0.8,
    metalness: 0.05,
    wireframe: isWireframe,
  });

  const veinMaterial = new THREE.LineBasicMaterial({
    color: 0x67e8f9, // Luminous cyan for vascular bundles
    linewidth: 2,
  });

  // Central Stem / Petiole
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1.0, 0),
    new THREE.Vector3(0.05, -0.2, 0.02),
    new THREE.Vector3(0.02, 0.6, -0.05),
    new THREE.Vector3(0, 1.2, 0),
  ]);

  const stemGeo = new THREE.TubeGeometry(stemCurve, 24, 0.045, 8, false);
  const stemMesh = new THREE.Mesh(stemGeo, stemMaterial);
  stemMesh.castShadow = true;
  stemMesh.receiveShadow = true;
  parentGroup.add(stemMesh);

  // Generate Leaves based on Model Type
  const leafCount = Math.max(3, morph.leafCount || 6);

  if (morph.modelType === "creeper" || morph.modelType === "simple-leaf") {
    // Fan/Reniform or Broad Ovate Leaves
    for (let i = 0; i < leafCount; i++) {
      const angle = (i / leafCount) * Math.PI * 2;
      const radius = 0.5 + (i % 2) * 0.3;
      const leafShape = new THREE.Shape();

      // Cordate / Kidney shape curve
      leafShape.moveTo(0, 0);
      leafShape.bezierCurveTo(0.25, 0.4, 0.6, 0.8, 0.4, 1.1);
      leafShape.bezierCurveTo(0.2, 1.3, -0.2, 1.3, -0.4, 1.1);
      leafShape.bezierCurveTo(-0.6, 0.8, -0.25, 0.4, 0, 0);

      const leafGeo = new THREE.ShapeGeometry(leafShape, 12);
      const leafMesh = new THREE.Mesh(leafGeo, leafMaterial);

      const yPos = -0.3 + (i / leafCount) * 1.0;
      leafMesh.position.set(Math.cos(angle) * radius, yPos, Math.sin(angle) * radius);
      leafMesh.rotation.x = Math.PI / 2.8 + Math.sin(i) * 0.2;
      leafMesh.rotation.y = angle;
      leafMesh.rotation.z = -angle;
      leafMesh.scale.set(0.65, 0.65, 0.65);
      parentGroup.add(leafMesh);

      // Vascular Veins Overlay
      if (showVeins) {
        const veinPoints = [
          new THREE.Vector3(0, 0, 0.01),
          new THREE.Vector3(0, 1.15, 0.01),
          new THREE.Vector3(0, 0.5, 0.01),
          new THREE.Vector3(0.35, 0.9, 0.01),
          new THREE.Vector3(0, 0.5, 0.01),
          new THREE.Vector3(-0.35, 0.9, 0.01),
        ];
        const veinGeo = new THREE.BufferGeometry().setFromPoints(veinPoints);
        const veinLine = new THREE.Line(veinGeo, veinMaterial);
        leafMesh.add(veinLine);
      }
    }
  } else if (morph.modelType === "compound-leaf") {
    // Feathery / Pinnate Compound Leaves (Moringa / Cumin / Amla style)
    for (let i = 0; i < leafCount; i++) {
      const height = -0.6 + (i / leafCount) * 1.4;
      const isLeft = i % 2 === 0;
      const sign = isLeft ? 1 : -1;

      // Leaflet pair
      const leafletGeo = new THREE.SphereGeometry(0.18, 12, 6);
      leafletGeo.scale(1.2, 0.1, 0.5);

      const leaflet = new THREE.Mesh(leafletGeo, leafMaterial);
      leaflet.position.set(sign * 0.35, height, 0);
      leaflet.rotation.z = sign * 0.35;
      leaflet.rotation.y = 0.2;
      parentGroup.add(leaflet);
    }
  } else {
    // Standard Shrub / Flower Stem (Adhatoda / Hibiscus / Datura / Tulsi)
    for (let i = 0; i < leafCount; i++) {
      const angle = (i * 137.5 * Math.PI) / 180; // Golden angle phyllotaxis
      const yPos = -0.5 + (i / leafCount) * 1.2;

      const leafShape = new THREE.Shape();
      leafShape.moveTo(0, 0);
      leafShape.quadraticCurveTo(0.3, 0.5, 0, 1.2);
      leafShape.quadraticCurveTo(-0.3, 0.5, 0, 0);

      const leafGeo = new THREE.ShapeGeometry(leafShape, 10);
      const leafMesh = new THREE.Mesh(leafGeo, leafMaterial);

      leafMesh.position.set(Math.cos(angle) * 0.15, yPos, Math.sin(angle) * 0.15);
      leafMesh.rotation.y = angle;
      leafMesh.rotation.x = 0.6;
      leafMesh.scale.set(0.7, 0.7, 0.7);
      parentGroup.add(leafMesh);

      if (showVeins) {
        const veinPoints = [
          new THREE.Vector3(0, 0, 0.01),
          new THREE.Vector3(0, 1.18, 0.01),
          new THREE.Vector3(0, 0.4, 0.01),
          new THREE.Vector3(0.18, 0.7, 0.01),
          new THREE.Vector3(0, 0.4, 0.01),
          new THREE.Vector3(-0.18, 0.7, 0.01),
        ];
        const veinGeo = new THREE.BufferGeometry().setFromPoints(veinPoints);
        const veinLine = new THREE.Line(veinGeo, veinMaterial);
        leafMesh.add(veinLine);
      }
    }

    // Terminal Flower Crown
    const flowerMat = new THREE.MeshStandardMaterial({
      color: flowerColor,
      roughness: 0.4,
      side: THREE.DoubleSide,
      wireframe: isWireframe,
    });

    const petalCount = 5;
    const flowerGroup = new THREE.Group();
    flowerGroup.position.set(0, 1.25, 0);

    for (let p = 0; p < petalCount; p++) {
      const pAngle = (p / petalCount) * Math.PI * 2;
      const petalGeo = new THREE.CylinderGeometry(0.04, 0.28, 0.5, 8);
      petalGeo.scale(1, 0.2, 1);
      const petal = new THREE.Mesh(petalGeo, flowerMat);
      petal.position.set(Math.cos(pAngle) * 0.25, 0, Math.sin(pAngle) * 0.25);
      petal.rotation.z = Math.cos(pAngle) * 0.6;
      petal.rotation.x = Math.sin(pAngle) * 0.6;
      petal.rotation.y = pAngle;
      flowerGroup.add(petal);
    }

    // Golden Stamen center
    const stamenGeo = new THREE.SphereGeometry(0.1, 10, 10);
    const stamenMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2 });
    const stamen = new THREE.Mesh(stamenGeo, stamenMat);
    flowerGroup.add(stamen);

    parentGroup.add(flowerGroup);
  }
}
