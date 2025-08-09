import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Model as GunModel } from "../../models/Gun1";
import { GunProps } from "../../types/game";
import { useAppStore } from "../../zustand/store"; 

export function Gun({
  isVisible, // Keep for backward compatibility but make optional
  onShoot,
}: GunProps): JSX.Element | null {
  const gunRef = useRef<THREE.Group>(null);
  const { camera, scene } = useThree();
  
  // Get gun visibility from store
  const { showGun } = useAppStore();
  
  // Use store value, but allow prop override for flexibility
  const shouldShow = isVisible !== undefined ? isVisible : showGun;

  // Timer to drive breathing motion
  const swayTime = useRef<number>(0);

  // Shooting and recoil state
  const [isRecoiling, setIsRecoiling] = useState<boolean>(false);
  const recoilTime = useRef<number>(0);
  const shootSound = useRef<HTMLAudioElement | null>(null);

  // Load and apply textures
  useEffect(() => {
    // Load shoot sound
    const audio = new Audio("/shot.mp3");
    audio.volume = 0.7;
    shootSound.current = audio;

    if (gunRef.current) {
      const textureLoader = new THREE.TextureLoader();

      // Load beretta (gun) textures
      const berettaColor = textureLoader.load("/textures/berettaColor.png");
      const berettaNormal = textureLoader.load("/textures/berettaNormal.png");
      const berettaMetallic = textureLoader.load(
        "/textures/berettaMetallic.png"
      );
      const berettaRoughness = textureLoader.load(
        "/textures/berettaRoughness.png"
      );
      const berettaAO = textureLoader.load("/textures/berettaAO.png");

      // Load arms textures
      const armsColor = textureLoader.load("/textures/armsColor.png");
      const armsNormal = textureLoader.load("/textures/armsNormal.png");
      const armsRoughness = textureLoader.load("/textures/armsRoughness.png");
      const armsAO = textureLoader.load("/textures/armsAO.png");

      // Apply textures to materials
      gunRef.current.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material) {
          const mesh = child as THREE.Mesh;
          const material = mesh.material as THREE.MeshStandardMaterial;

          if (material.name === "beretta") {
            // Apply beretta textures
            material.map = berettaColor;
            material.normalMap = berettaNormal;
            material.metalnessMap = berettaMetallic;
            material.roughnessMap = berettaRoughness;
            material.aoMap = berettaAO;

            // Set material properties for realistic gun metal
            material.metalness = 1.0;
            material.roughness = 0.4;
            material.aoMapIntensity = 1.0;

            // Enable shadows
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            material.needsUpdate = true;
          }

          if (material.name === "arms") {
            // Apply arms textures
            material.map = armsColor;
            material.normalMap = armsNormal;
            material.roughnessMap = armsRoughness;
            material.aoMap = armsAO;

            // Set material properties for skin
            material.metalness = 0.0;
            material.roughness = 0.8;
            material.aoMapIntensity = 1.0;

            // Enable shadows
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            material.needsUpdate = true;
          }
        }
      });
    }

    // Add mouse click event listener for shooting
    const handleMouseClick = (event: MouseEvent) => {
      if (event.button === 0 && shouldShow) {
        // Left mouse button - only shoot if gun is visible
        shoot();
      }
    };

    document.addEventListener("mousedown", handleMouseClick);

    return () => {
      document.removeEventListener("mousedown", handleMouseClick);
      if (shootSound.current) {
        shootSound.current = null;
      }
    };
  }, [shouldShow]); // Update dependency to use shouldShow

  // Shoot function
  const shoot = (): void => {
    if (isRecoiling) return; // Prevent shooting while already recoiling

    // Play shoot sound
    if (shootSound.current) {
      shootSound.current.currentTime = 0; // Reset to beginning
      shootSound.current.play().catch((error: Error) => {
        console.log("Failed to play shoot sound:", error);
      });
    }

    // Perform raycast from camera center
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);

    raycaster.set(camera.position, direction);
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Filter out gun and non-solid objects
    const validIntersects = intersects.filter(
      (intersect: THREE.Intersection) => {
        const object = intersect.object;
        // Include entities (enemies) and exclude gun, lights, cameras
        return (
          !(object as THREE.Light).isLight &&
          !(object as THREE.Camera).isCamera &&
          !gunRef.current?.children.some(
            (child: THREE.Object3D) =>
              child === object || child.children.includes(object)
          ) &&
          (object.userData?.isEntity ||
            ((object as THREE.Mesh).geometry &&
              (object as THREE.Mesh).material)) &&
          object.visible
        );
      }
    );

    if (validIntersects.length > 0 && onShoot) {
      const hit = validIntersects[0];
      onShoot(hit, camera.position);
    }

    // Start recoil animation
    setIsRecoiling(true);
    recoilTime.current = 0;

    // Stop recoil after a short duration
    setTimeout(() => {
      setIsRecoiling(false);
    }, 200); // 200ms recoil duration
  };

  useFrame((_, delta: number) => {
    if (!gunRef.current || !shouldShow) return; // Use shouldShow instead of isVisible

    // Increment sway timer
    swayTime.current += delta;

    // Breathing sway amount (sinusoidal vertical movement)
    const swayY = Math.sin(swayTime.current * 2) * 0.01;

    // Base position from camera
    const gunPosition = new THREE.Vector3();
    camera.getWorldPosition(gunPosition);

    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    const down = new THREE.Vector3(0, -1, 0);

    forward.applyQuaternion(camera.quaternion);
    right.applyQuaternion(camera.quaternion);
    down.applyQuaternion(camera.quaternion);

    gunPosition.add(forward.multiplyScalar(0.5));
    gunPosition.add(right.multiplyScalar(0.3));
    gunPosition.add(down.multiplyScalar(0.2 + swayY));

    // Handle recoil animation
    let recoilOffset = new THREE.Vector3();
    let recoilRotation = { x: 0, y: 0, z: 0 };

    if (isRecoiling) {
      recoilTime.current += delta;

      // Recoil parameters
      const recoilDuration = 0.2; // 200ms
      const recoilProgress = Math.min(recoilTime.current / recoilDuration, 1);

      // Easing function for smooth recoil (ease-out)
      const easedProgress = 1 - Math.pow(1 - recoilProgress, 3);

      // Recoil movements
      const maxBackwardRecoil = 0.15; // Move gun backward
      const maxUpwardRecoil = 0.08; // Move gun up slightly
      const maxRotationRecoil = -0.3; // Rotate gun up

      // Calculate recoil offsets (reverse the motion for return effect)
      const backwardRecoil =
        Math.sin(easedProgress * Math.PI) * maxBackwardRecoil;
      const upwardRecoil = Math.sin(easedProgress * Math.PI) * maxUpwardRecoil;
      const rotationRecoil =
        Math.sin(easedProgress * Math.PI) * maxRotationRecoil;

      // Apply recoil to position
      recoilOffset.add(forward.clone().multiplyScalar(-backwardRecoil)); // Push backward
      recoilOffset.add(down.clone().multiplyScalar(-upwardRecoil)); // Push up

      // Apply recoil to rotation
      recoilRotation.x = -rotationRecoil; // Rotate gun upward
      recoilRotation.z = (Math.random() - 0.5) * 0.1; // Small random roll
    }

    // Apply final position with recoil
    gunPosition.add(recoilOffset);
    gunRef.current.position.copy(gunPosition);

    // Apply rotation via quaternion to prevent flipping
    gunRef.current.quaternion.copy(camera.quaternion);
    gunRef.current.rotateX(0.1 + recoilRotation.x); // Slight downward tilt + recoil
    gunRef.current.rotateY(Math.PI); // Face forward
    gunRef.current.rotateZ(recoilRotation.z); // Add recoil roll
  });

  if (!shouldShow) return null; // Use shouldShow instead of isVisible

  return (
    <group ref={gunRef}>
      {/* Enhanced lighting for better texture visibility */}
      <pointLight
        position={[0.3, 0.2, 0.4]}
        intensity={1.5}
        distance={3}
        decay={1}
        color="#ffffff"
      />
      <pointLight
        position={[-0.2, -0.1, 0.3]}
        intensity={1.0}
        distance={2}
        decay={2}
        color="#fff8dc"
      />
      <GunModel scale={[1, 1, 1]} />
    </group>
  );
}