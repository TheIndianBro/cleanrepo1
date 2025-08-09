import { create } from 'zustand';
import { Vector3 } from 'three';

// Import all Dojo hooks (for future use - not implemented yet)
import {
  // Player and game state hooks
  
  useGameConfig,
  useGameSession,
  usePlayerStats,
  
  // World model hooks
  useRoom,
  useEntity,
  useDoor,
  useDoorway,
  useEntityState,
  useShardLocation,
  useTurnExecution,
  useGridBounds,
  usePosition,
  
  // Action hooks
  useInitializePlayer,
  useStartGame,
  useEndGame,
  useRespawnPlayer,
  useMovePlayer,
  useAttackEntity,
  useCollectShard,
  useOpenDoor,
  useExecuteTurn,
  useValidateActions,
  
  // Query hooks
  useGetPlayerState,
  useGetRoomState,
  useGetEntitiesInLocation,
  useGetAvailableDoorways,
  useGetGameStatus,
  useGetTurnHistory,
  
  // Event hooks
  useActionExecuted,
  useGameCompleted,
  useGameStarted,
  useNumberedShardCollected,
  usePlayerDeath,
  useRoomCleared,
  useTurnExecuted,
  useVictoryAchieved,
  
  // Enum utility hooks
  useAlertLevel,
  useEntityType,
  useNumberedShard,
  useActionType,
  useGameResult,
  
  // Legacy hooks

  useStarknetConnect,
} from '../dojo/hooks';

interface GameSessionState {
  gameStarted: boolean;
  showWarning: boolean;
  startGame: () => void;
  hideWarning: () => void;
}

interface UIState {
  showGun: boolean;
  showCrosshair: boolean;
  showMapTracker: boolean;
  toggleGun: () => void;
  toggleCrosshair: () => void;
  toggleMapTracker: () => void;
  setGunVisibility: (visible: boolean) => void;
}

interface PlayerState {
  position: Vector3;
  rotation: number;
  health: number;
  isMoving: boolean;
  velocity: Vector3;
  updatePosition: (position: Vector3) => void;
  updateRotation: (rotation: number) => void;
  setMoving: (moving: boolean) => void;
  setVelocity: (velocity: Vector3) => void;
  takeDamage: (damage: number) => void;
  heal: (amount: number) => void;
  resetPlayer: () => void;
}

interface DojoGameState {
  // Player state (for future Dojo integration)
  player: any;
  playerStats: any;
  gameConfig: any;
  gameSession: any;
  
  // World state (for future Dojo integration)
  currentRoom: any;
  entities: any[];
  doors: any[];
  doorways: any[];
  shardLocations: any[];
  
  // Game state (for future Dojo integration)
  gameStatus: any;
  turnHistory: any[];
  availableDoorways: any[];
  
  // Events (for future Dojo integration)
  recentEvents: {
    actionExecuted: any[];
    gameCompleted: any[];
    gameStarted: any[];
    numberedShardCollected: any[];
    playerDeath: any[];
    roomCleared: any[];
    turnExecuted: any[];
    victoryAchieved: any[];
  };
  
  // Loading states (for future Dojo integration)
  isLoading: {
    player: boolean;
    gameConfig: boolean;
    room: boolean;
    entities: boolean;
    doors: boolean;
  };
  
  // Error states (for future Dojo integration)
  errors: {
    player: string | null;
    gameConfig: string | null;
    room: string | null;
    entities: string | null;
    doors: string | null;
  };
}

interface AppState extends GameSessionState, UIState, PlayerState, DojoGameState {}

// Updated initial position to moderate coordinates for optimal precision
const initialPlayerPosition = new Vector3(100, 1.5, 100);
const initialVelocity = new Vector3(0, 0, 0);

export const useAppStore = create<AppState>((set, get) => ({
  // Game Session State
  gameStarted: false,
  showWarning: true,
  
  // UI State
  showGun: true,
  showCrosshair: true,
  showMapTracker: true,
  
  // Player State - Now starts at map center
  position: initialPlayerPosition.clone(),
  rotation: 0,
  health: 100,
  isMoving: false,
  velocity: initialVelocity.clone(),
  
  // Dojo Game State - Initialize with empty values (for future integration)
  player: null,
  playerStats: null,
  gameConfig: null,
  gameSession: null,
  currentRoom: null,
  entities: [],
  doors: [],
  doorways: [],
  shardLocations: [],
  gameStatus: null,
  turnHistory: [],
  availableDoorways: [],
  recentEvents: {
    actionExecuted: [],
    gameCompleted: [],
    gameStarted: [],
    numberedShardCollected: [],
    playerDeath: [],
    roomCleared: [],
    turnExecuted: [],
    victoryAchieved: [],
  },
  isLoading: {
    player: false,
    gameConfig: false,
    room: false,
    entities: false,
    doors: false,
  },
  errors: {
    player: null,
    gameConfig: null,
    room: null,
    entities: null,
    doors: null,
  },
  
  // Game Session Actions
  startGame: () => set({ gameStarted: true }),
  hideWarning: () => set({ showWarning: false }),
  
  // UI Actions
  toggleGun: () => set((state) => ({ showGun: !state.showGun })),
  toggleCrosshair: () => set((state) => ({ showCrosshair: !state.showCrosshair })),
  toggleMapTracker: () => set((state) => ({ showMapTracker: !state.showMapTracker })),
  setGunVisibility: (visible) => set({ showGun: visible }),
  
  // Player Actions
  updatePosition: (position) => set({ position: position.clone() }),
  updateRotation: (rotation) => set({ rotation }),
  setMoving: (moving) => set({ isMoving: moving }),
  setVelocity: (velocity) => set({ velocity: velocity.clone() }),
  takeDamage: (damage) => set((state) => ({ 
    health: Math.max(0, state.health - damage) 
  })),
  heal: (amount) => set((state) => ({ 
    health: Math.min(100, state.health + amount) 
  })),
  resetPlayer: () => set({ 
    position: initialPlayerPosition.clone(),
    rotation: 0,
    health: 100,
    isMoving: false,
    velocity: initialVelocity.clone()
  }),
}));

// Export all hooks for future use (currently imported but not implemented)
export {
  // Player and game state hooks

  useGameConfig,
  useGameSession,
  usePlayerStats,
  
  // World model hooks
  useRoom,
  useEntity,
  useDoor,
  useDoorway,
  useEntityState,
  useShardLocation,
  useTurnExecution,
  useGridBounds,
  usePosition,
  
  // Action hooks
  useInitializePlayer,
  useStartGame,
  useEndGame,
  useRespawnPlayer,
  useMovePlayer,
  useAttackEntity,
  useCollectShard,
  useOpenDoor,
  useExecuteTurn,
  useValidateActions,
  
  // Query hooks
  useGetPlayerState,
  useGetRoomState,
  useGetEntitiesInLocation,
  useGetAvailableDoorways,
  useGetGameStatus,
  useGetTurnHistory,
  
  // Event hooks
  useActionExecuted,
  useGameCompleted,
  useGameStarted,
  useNumberedShardCollected,
  usePlayerDeath,
  useRoomCleared,
  useTurnExecuted,
  useVictoryAchieved,
  
  // Enum utility hooks
  useAlertLevel,
  useEntityType,
  useNumberedShard,
  useActionType,
  useGameResult,
  
  // Legacy hooks

  useStarknetConnect,
};