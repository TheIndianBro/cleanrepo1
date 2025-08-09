Action Hooks (for contract functions):
useAttackEntity - Hook for attacking entities
useCollectShard - Hook for collecting shards
useEndGame - Hook for ending the game
useExecuteTurn - Hook for executing turns with multiple actions
useGetAvailableDoorways - Hook for getting available doorways in a location
useGetEntitiesInLocation - Hook for getting entities in a location
useGetGameStatus - Hook for getting current game status
useGetPlayerState - Hook for getting player state
useGetRoomState - Hook for getting room state
useGetTurnHistory - Hook for getting turn history
useInitializePlayer - Hook for initializing a player
useMovePlayer - Hook for moving the player
useOpenDoor - Hook for opening doors
useRespawnPlayer - Hook for respawning the player
useStartGame - Hook for starting a new game
useValidateActions - Hook for validating actions before execution

Model Hooks (for data fetching):
useGameConfig - Hook for fetching game configuration
useGameSession - Hook for fetching game session data
usePlayerStats - Hook for fetching player statistics
useRoom - Hook for fetching room data
useEntity - Hook for fetching entity data
useDoor - Hook for fetching door data
useShardLocation - Hook for fetching shard location data

Key Features of Each Hook:
Consistent API: All hooks follow the same pattern with isLoading, error, and resetError
Error Handling: Comprehensive error handling with try-catch blocks
Loading States: Loading indicators for better UX
GraphQL Integration: Uses GraphQL queries to fetch data from the Torii indexer
TypeScript Support: Full TypeScript support with proper type definitions
Account Integration: Uses Starknet account for authenticated operations
Logging: Console logging for debugging and monitoring