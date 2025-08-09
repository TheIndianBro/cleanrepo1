# Dojo Hooks Documentation

This directory contains React hooks for interacting with the Dojo game world. All hooks are designed to work with the Torii indexer and provide a clean interface for game state management.

## 📁 Hook Categories

### 🎮 Player & Game State Hooks
These hooks manage player data and game configuration:

- **`usePlayer`** - Fetch player data and state
- **`useGameConfig`** - Get game configuration settings
- **`useGameSession`** - Manage current game session
- **`usePlayerStats`** - Access player statistics and achievements

### 🌍 World Model Hooks
These hooks fetch world data and entities:

- **`useRoom`** - Get room information and state
- **`useEntity`** - Fetch entity data (enemies, NPCs)
- **`useDoor`** - Get door information and state
- **`useDoorway`** - Access doorway data
- **`useEntityState`** - Get entity behavior and alert states
- **`useShardLocation`** - Find shard locations
- **`useTurnExecution`** - Access turn execution data
- **`useGridBounds`** - Get grid boundary information
- **`usePosition`** - Utility for position data

### ⚡ Action Hooks
These hooks execute game actions and transactions:

- **`useInitializePlayer`** - Initialize a new player
- **`useStartGame`** - Start a new game session
- **`useEndGame`** - End the current game
- **`useRespawnPlayer`** - Respawn the player
- **`useMovePlayer`** - Move the player in a direction
- **`useAttackEntity`** - Attack an entity
- **`useCollectShard`** - Collect a shard
- **`useOpenDoor`** - Open a door
- **`useExecuteTurn`** - Execute a turn with multiple actions
- **`useValidateActions`** - Validate actions before execution

### 🔍 Query Hooks
These hooks fetch specific game state information:

- **`useGetPlayerState`** - Get detailed player state
- **`useGetRoomState`** - Get current room state
- **`useGetEntitiesInLocation`** - Find entities in a location
- **`useGetAvailableDoorways`** - Get available doorways
- **`useGetGameStatus`** - Get overall game status
- **`useGetTurnHistory`** - Access turn history

### 📡 Event Hooks
These hooks listen to game events:

- **`useActionExecuted`** - Listen to action execution events
- **`useGameCompleted`** - Listen to game completion events
- **`useGameStarted`** - Listen to game start events
- **`useNumberedShardCollected`** - Listen to shard collection events
- **`usePlayerDeath`** - Listen to player death events
- **`useRoomCleared`** - Listen to room clearing events
- **`useTurnExecuted`** - Listen to turn execution events
- **`useVictoryAchieved`** - Listen to victory events

### 🎯 Enum Utility Hooks
These hooks provide utilities for working with game enums:

- **`useAlertLevel`** - Work with entity alert levels (Idle, Alerted, Combat)
- **`useEntityType`** - Work with entity types (Male, Female)
- **`useNumberedShard`** - Work with shard types (One, Two, Three)
- **`useActionType`** - Work with action types (Move, OpenDoor, Attack, CollectShard)
- **`useGameResult`** - Work with game results (InProgress, Victory, Defeat)

### 🔗 Connection Hooks
- **`useStarknetConnect`** - Manage Starknet wallet connection

## 🚀 Usage Examples

### Basic Hook Usage

```typescript
import { usePlayer, useGameConfig, useMovePlayer } from '../dojo/hooks';

function GameComponent() {
  // Fetch player data
  const { player, isLoading, error, refetch } = usePlayer();
  
  // Get game configuration
  const { gameConfig } = useGameConfig();
  
  // Action hook for moving player
  const { movePlayer, isLoading: moveLoading, error: moveError } = useMovePlayer();
  
  const handleMove = async () => {
    try {
      await movePlayer('north');
      console.log('Player moved successfully');
    } catch (error) {
      console.error('Failed to move player:', error);
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h2>Player Health: {player?.health}</h2>
      <button onClick={handleMove} disabled={moveLoading}>
        {moveLoading ? 'Moving...' : 'Move North'}
      </button>
    </div>
  );
}
```

### Using Enum Utilities

```typescript
import { useEntityType, useAlertLevel } from '../dojo/hooks';

function EntityInfo({ entity }) {
  const { getEntityTypeName, isMale, isFemale } = useEntityType();
  const { getAlertLevelName, isIdle, isAlerted, isCombat } = useAlertLevel();
  
  return (
    <div>
      <p>Type: {getEntityTypeName(entity.entity_type)}</p>
      <p>Alert Level: {getAlertLevelName(entity.alert_level)}</p>
      <p>Is Male: {isMale(entity.entity_type) ? 'Yes' : 'No'}</p>
      <p>Is Alerted: {isAlerted(entity.alert_level) ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Event Listening

```typescript
import { useActionExecuted, usePlayerDeath } from '../dojo/hooks';

function EventListener() {
  const { actionExecuted, isLoading, error } = useActionExecuted();
  const { playerDeath } = usePlayerDeath();
  
  useEffect(() => {
    if (actionExecuted) {
      console.log('Action executed:', actionExecuted);
      // Handle action event
    }
  }, [actionExecuted]);
  
  useEffect(() => {
    if (playerDeath) {
      console.log('Player died:', playerDeath);
      // Handle death event
    }
  }, [playerDeath]);
  
  return <div>Listening for events...</div>;
}
```

### Complex Game Actions

```typescript
import { useExecuteTurn, useValidateActions } from '../dojo/hooks';

function TurnManager() {
  const { executeTurn, isLoading: executeLoading } = useExecuteTurn();
  const { validateActions, isLoading: validateLoading } = useValidateActions();
  
  const handleComplexTurn = async () => {
    const actions = [
      { action: 'move', direction: 'north' },
      { action: 'attack', entityId: '123' },
      { action: 'collect', shardId: '456' }
    ];
    
    try {
      // First validate the actions
      await validateActions(actions);
      console.log('Actions are valid');
      
      // Then execute the turn
      await executeTurn(actions);
      console.log('Turn executed successfully');
    } catch (error) {
      console.error('Turn failed:', error);
    }
  };
  
  return (
    <button 
      onClick={handleComplexTurn} 
      disabled={executeLoading || validateLoading}
    >
      {executeLoading || validateLoading ? 'Processing...' : 'Execute Turn'}
    </button>
  );
}
```

## 🔧 Hook Interface

All hooks follow a consistent interface:

### Data Hooks (usePlayer, useRoom, etc.)
```typescript
interface DataHookReturn {
  data: T | null;           // The fetched data
  isLoading: boolean;        // Loading state
  error: Error | null;       // Error state
  refetch: () => Promise<void>; // Function to refetch data
}
```

### Action Hooks (useMovePlayer, useAttackEntity, etc.)
```typescript
interface ActionHookReturn {
  action: (params: any) => Promise<void>; // Action function
  isLoading: boolean;                      // Loading state
  error: Error | null;                     // Error state
  resetError: () => void;                  // Reset error function
}
```

### Enum Utility Hooks (useAlertLevel, useEntityType, etc.)
```typescript
interface EnumHookReturn {
  enumValues: typeof enumType;             // Available enum values
  getEnumName: (value: EnumType) => string; // Get enum name
  isValue: (value: EnumType) => boolean;   // Check specific values
  // ... other utility functions
}
```

## 🎯 Best Practices

1. **Error Handling**: Always check for errors and loading states
2. **Refetching**: Use `refetch` functions to update data when needed
3. **Action Validation**: Validate actions before executing them
4. **Event Cleanup**: Clean up event listeners when components unmount
5. **Type Safety**: Use TypeScript interfaces for better type safety

## 🔄 State Management

The hooks integrate with the Zustand store (`useAppStore`) to provide global state management. The `GameManager` component orchestrates all hooks and manages the overall game state.

## 🐛 Debugging

All hooks include console logging for debugging:
- ✅ Success messages for successful operations
- ❌ Error messages for failed operations
- 📊 Data logging for state changes

## 📦 Importing Hooks

```typescript
// Import individual hooks
import { usePlayer, useGameConfig } from '../dojo/hooks';

// Import all hooks
import * as DojoHooks from '../dojo/hooks';

// Import from store (recommended)
import { usePlayer, useGameConfig } from '../zustand/store';
```

## 🚀 Integration with Components

The hooks are integrated into the frontend through:

1. **GameManager** - Orchestrates all hooks and manages game state
2. **GameInfo** - Displays game information using data hooks
3. **GameActions** - Provides UI for executing actions
4. **App.tsx** - Wraps the entire application with GameManager

This comprehensive hook system provides a complete interface for interacting with the Dojo game world, making it easy to build rich, interactive game experiences. 