import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { Vector3 } from "three";
import * as THREE from "three";

import { useAppStore } from "../zustand/store";
import {
  useStarknetConnect,
  useStartGame,
  useInitializePlayer,
  useRespawnPlayer,
  useEndGame,
  useMovePlayer,
  useOpenDoor,
  useAttackEntity,
  useCollectShard,
  useExecuteTurn,
} from "../dojo/hooks";

import { WarningDialog } from "../components/ui/WarningDialog";

import { Crosshair } from "../components/ui/Crosshair";
// import { Instructions } from "../components/ui/Instructions";
import { MapTracker } from "../components/systems/MapTracker";
import { Gun } from "../components/game/Gun";

import { BloodEffect } from "../components/game/BloodEffect";
import { BulletHole } from "../components/game/BulletHole";
import { AudioManager } from "../components/systems/AudioManager";

import { FirstPersonControls } from "../components/systems/FirstPersonControls";
import { Model } from "../models/Poc2";

// Import types
import {
  BloodEffect as BloodEffectType,
  BulletHole as BulletHoleType,
} from "../types/game";

const App = (): JSX.Element => {
  // Get game session state, UI state, and player state from Zustand store
  const { 
    gameStarted, 
    showWarning, 
    showGun,
    showCrosshair,
    showMapTracker,
    position: playerPosition,
    rotation: playerRotation,
    startGame, 
    hideWarning,
    updatePosition,
    updateRotation
  } = useAppStore();

  // Wallet connection
  const { status, address, handleConnect, handleDisconnect, isConnecting } = useStarknetConnect();

  // Action hooks
  const { startGame: startGameTx, isLoading: startingGame } = useStartGame();
  const { initializePlayer, isLoading: initializingPlayer } = useInitializePlayer();
  const { respawnPlayer, isLoading: respawning } = useRespawnPlayer();
  const { endGame: endGameTx, isLoading: endingGame } = useEndGame();
  const { movePlayer, isLoading: moving } = useMovePlayer();
  const { openDoor, isLoading: openingDoor } = useOpenDoor();
  const { attackEntity, isLoading: attacking } = useAttackEntity();
  const { collectShard, isLoading: collecting } = useCollectShard();
  const { executeTurn, isLoading: executingTurn } = useExecuteTurn();

  // Inputs for parameterized actions
  const [xDelta, setXDelta] = useState<number>(1);
  const [yDelta, setYDelta] = useState<number>(0);
  const [doorId, setDoorId] = useState<number>(0);
  const [entityId, setEntityId] = useState<number>(0);
  const [shardX, setShardX] = useState<number>(0);
  const [shardY, setShardY] = useState<number>(0);
  const [shardLocationId, setShardLocationId] = useState<number>(0);

  // Initialize player position at map center on component mount
  useEffect(() => {
    const mapCenterPosition = new Vector3(400, 1.5, 400);
    updatePosition(mapCenterPosition);
  }, [updatePosition]);

  // Keep local state for things that don't need global state management
  const [bulletHoles, setBulletHoles] = useState<BulletHoleType[]>([]);
  const [bloodEffects, setBloodEffects] = useState<BloodEffectType[]>([]);

  // These handlers now update the Zustand store
  const handlePositionUpdate = (position: Vector3): void => {
    updatePosition(position);
  };

  const handleRotationUpdate = (rotation: number): void => {
    updateRotation(rotation);
  };

  const handleWarningAccept = (): void => {
    hideWarning();
    startGame();
  };

  const handleExecuteSampleTurn = async (): Promise<void> => {
    try {
      await (executeTurn as unknown as (a: any) => Promise<void>)([
        { type: "Move", data: { xDelta, yDelta } },
      ]);
    } catch (error) {
      console.error("Failed to execute sample turn", error);
    }
  };

  // Handle shooting hits
  const handleShoot = (
    hit: THREE.Intersection,
    cameraPosition: Vector3
  ): void => {
    const hitObject = hit.object;
    const hitPoint = hit.point;
    const hitNormal = hit.face?.normal;

    // Check if enemy was hit
    if (hitObject.userData?.isEntity) {
      console.log("Enemy hit!");

      // Add blood effect
      const bloodId = Date.now() + Math.random();
      setBloodEffects((prev: BloodEffectType[]) => [
        ...prev,
        {
          id: bloodId,
          position: hitPoint.clone(),
        },
      ]);

      // Damage the enemy
      if (hitObject.userData.takeDamage) {
        hitObject.userData.takeDamage(100); // One shot kill
      }
    } else if (hitNormal) {
      // Add bullet hole for wall hits
      console.log("Wall hit at:", hitPoint);
      const holeId = Date.now() + Math.random();
      const offsetPosition = hitPoint
        .clone()
        .add(hitNormal.clone().multiplyScalar(0.01));
      setBulletHoles((prev: BulletHoleType[]) => [
        ...prev,
        {
          id: holeId,
          position: offsetPosition,
          normal: hitNormal.clone(),
          cameraPosition: cameraPosition.clone(),
        },
      ]);
    }
  };

  // Remove blood effect
  const removeBloodEffect = (id: number): void => {
    setBloodEffects((prev: BloodEffectType[]) =>
      prev.filter((effect: BloodEffectType) => effect.id !== id)
    );
  };

  // Remove bullet hole
  const removeBulletHole = (id: number): void => {
    setBulletHoles((prev: BulletHoleType[]) =>
      prev.filter((hole: BulletHoleType) => hole.id !== id)
    );
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Top HUD with connection and action buttons */}
      <div className="absolute top-0 left-0 right-0 z-50 p-3 flex flex-wrap items-center gap-2 bg-black/40">
        {status !== "connected" ? (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <>
            <span className="text-green-300 text-xs mr-2">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            <button onClick={handleDisconnect} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm">Disconnect</button>
          </>
        )}

        <div className="mx-2 h-5 w-px bg-white/30" />

        <button
          onClick={startGameTx}
          disabled={status !== "connected" || startingGame}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
        >
          {startingGame ? "Starting..." : "Start Game"}
        </button>

        <button
          onClick={initializePlayer}
          disabled={status !== "connected" || initializingPlayer}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
        >
          {initializingPlayer ? "Initializing..." : "Initialize Player"}
        </button>

        <button
          onClick={respawnPlayer}
          disabled={status !== "connected" || respawning}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
        >
          {respawning ? "Respawning..." : "Respawn"}
        </button>

        <button
          onClick={endGameTx}
          disabled={status !== "connected" || endingGame}
          className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
        >
          {endingGame ? "Ending..." : "End Game"}
        </button>

        <div className="mx-2 h-5 w-px bg-white/30" />

        <div className="flex items-center gap-1 text-white/80 text-xs">
          <label>Δx</label>
          <input type="number" value={xDelta} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setXDelta(Number(e.target.value))} className="w-14 px-1 py-0.5 rounded bg-black/50 border border-white/20" />
          <label>Δy</label>
          <input type="number" value={yDelta} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYDelta(Number(e.target.value))} className="w-14 px-1 py-0.5 rounded bg-black/50 border border-white/20" />
          <button
            onClick={() => movePlayer(xDelta, yDelta)}
            disabled={status !== "connected" || moving}
            className="ml-1 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
          >
            {moving ? "Moving..." : "Move"}
          </button>
        </div>

        <div className="flex items-center gap-1 text-white/80 text-xs">
          <label>Door</label>
          <input type="number" value={doorId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDoorId(Number(e.target.value))} className="w-16 px-1 py-0.5 rounded bg-black/50 border border-white/20" />
          <button
            onClick={() => openDoor(doorId)}
            disabled={status !== "connected" || openingDoor}
            className="ml-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
          >
            {openingDoor ? "Opening..." : "Open Door"}
          </button>
        </div>

        <div className="flex items-center gap-1 text-white/80 text-xs">
          <label>Entity</label>
          <input type="number" value={entityId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEntityId(Number(e.target.value))} className="w-16 px-1 py-0.5 rounded bg-black/50 border border-white/20" />
          <button
            onClick={() => attackEntity(entityId)}
            disabled={status !== "connected" || attacking}
            className="ml-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
          >
            {attacking ? "Attacking..." : "Attack"}
          </button>
        </div>

        <div className="flex items-center gap-1 text-white/80 text-xs">
          <label>Shard x</label>
          <input type="number" value={shardX} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShardX(Number(e.target.value))} className="w-16 px-1 py-0.5 rounded bg-black/50 border border-white/20" />
          <label>y</label>
          <input type="number" value={shardY} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShardY(Number(e.target.value))} className="w-16 px-1 py-0.5 rounded bg-black/50 border border-white/20" />
          <label>loc</label>
          <input type="number" value={shardLocationId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShardLocationId(Number(e.target.value))} className="w-16 px-1 py-0.5 rounded bg-black/50 border border-white/20" />
          <button
            onClick={() => collectShard({ x: shardX, y: shardY, location_id: shardLocationId })}
            disabled={status !== "connected" || collecting}
            className="ml-1 bg-lime-600 hover:bg-lime-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
          >
            {collecting ? "Collecting..." : "Collect Shard"}
          </button>
        </div>

        <button
          onClick={handleExecuteSampleTurn}
          disabled={status !== "connected" || executingTurn}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
        >
          {executingTurn ? "Executing..." : "Execute Turn (sample)"}
        </button>
      </div>
      {/* Warning Dialog */}
      {showWarning && <WarningDialog onAccept={handleWarningAccept} />}

      {/* Silent audio manager - no UI */}
      <AudioManager />

      {/* Instructions */}
      {/* {gameStarted && <Instructions />} */}

      {/* Crosshair */}
      {gameStarted && showCrosshair && <Crosshair />}

      {/* Map Tracker - Updated with new coordinate system */}
      {gameStarted && showMapTracker && (
        <MapTracker
          playerPosition={playerPosition}
          playerRotation={playerRotation}
          mapScale={30} // Adjust this based on your game world scale
          size={250} // Size of the tracker in pixels
        />
      )}

      <Canvas
        camera={{
          fov: 75,
          position: [400, 1.5, 400], // Start at map center coordinates
          rotation: [0, 0, 0],
          near: 0.1,
          far: 1000,
        }}
        onCreated={({ camera }: { camera: THREE.PerspectiveCamera }) => {
          camera.rotation.set(0, 0, 0);
          camera.lookAt(400, 1.5, 399); // Look forward from the starting position
        }}
      >
        {/* Enhanced atmospheric lighting for better texture visibility at map center */}
        <ambientLight intensity={0.3} color="#fff8dc" />
        <directionalLight
          position={[420, 20, 420]} // Positioned above and offset from map center
          intensity={0.8}
          color="#fff8dc"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        <directionalLight
          position={[380, 15, 380]} // Secondary light from opposite direction
          intensity={0.4}
          color="#f4e4bc"
        />
        <pointLight
          position={[400, 10, 400]} // Central point light at map center
          intensity={0.5}
          color="#fff8dc"
          distance={100}
        />

        {/* Pointer lock controls for first person view */}
        <PointerLockControls />

        {/* First person movement controller with rotation tracking */}
        <FirstPersonControls 
          onPositionUpdate={handlePositionUpdate}
          onRotationUpdate={handleRotationUpdate}
        />

        {/* The backrooms model */}
        <Model />

        {/* The gun model */}
        {gameStarted && showGun && <Gun isVisible={showGun} onShoot={handleShoot} />}

        {/* Blood effects */}
        {bloodEffects.map((effect: BloodEffectType) => (
          <React.Fragment key={effect.id}>
            <BloodEffect
              position={effect.position}
              onComplete={() => removeBloodEffect(effect.id)}
            />
          </React.Fragment>
        ))}

        {/* Bullet holes */}
        {bulletHoles.map((hole: BulletHoleType) => (
          <React.Fragment key={hole.id}>
            <BulletHole
              position={hole.position}
              normal={hole.normal}
              cameraPosition={hole.cameraPosition}
              onComplete={() => removeBulletHole(hole.id)}
            />
          </React.Fragment>
        ))}
      </Canvas>
    </div>
  );
};

export default App;