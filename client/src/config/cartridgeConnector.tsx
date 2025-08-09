import { Connector } from "@starknet-react/core";
import { ControllerConnector } from "@cartridge/connector";
import { ControllerOptions } from "@cartridge/controller";
import { constants } from "starknet";
import { manifest } from "./manifest";

const { VITE_PUBLIC_DEPLOY_TYPE } = import.meta.env;

console.log("VITE_PUBLIC_DEPLOY_TYPE", VITE_PUBLIC_DEPLOY_TYPE);

const getRpcUrl = () => {
  switch (VITE_PUBLIC_DEPLOY_TYPE) {
    case "localhost":
        return "http://localhost:5050"; // Katana localhost default port
    case "mainnet":
        return "https://api.cartridge.gg/x/starknet/mainnet";
    case "sepolia":
        return "https://api.cartridge.gg/x/starknet/sepolia";
    default:
        return "https://api.cartridge.gg/x/starknet/sepolia";
  }
};

const getDefaultChainId = () => {
  switch (VITE_PUBLIC_DEPLOY_TYPE) {
    case "localhost":
        return "0x4b4154414e41"; // KATANA in ASCII
    case "mainnet":
        return constants.StarknetChainId.SN_MAIN;
    case "sepolia":
        return constants.StarknetChainId.SN_SEPOLIA;
    default:
        return constants.StarknetChainId.SN_SEPOLIA;
  }
};

const getGameContractAddress = () => {
  return manifest.contracts[0].address;
};

const CONTRACT_ADDRESS_GAME = getGameContractAddress();
console.log("Using game contract address:", CONTRACT_ADDRESS_GAME);

const policies = {
  contracts: {
    [CONTRACT_ADDRESS_GAME]: {
      methods: [
        // Player management methods
        { name: "initialize_player", entrypoint: "initialize_player" },
        { name: "start_game", entrypoint: "start_game" },
        { name: "respawn_player", entrypoint: "respawn_player" },
        { name: "end_game", entrypoint: "end_game" },
        
        // Legacy/Additional methods (if needed)
        { name: "spawn_player", entrypoint: "spawn_player" },
        { name: "train", entrypoint: "train" },
        { name: "mine", entrypoint: "mine" },
        { name: "rest", entrypoint: "rest" },
        
        // Action execution methods
        { name: "execute_turn", entrypoint: "execute_turn" },
        { name: "validate_actions", entrypoint: "validate_actions" },
        
        // Individual action methods
        { name: "move_player", entrypoint: "move_player" },
        { name: "attack_entity", entrypoint: "attack_entity" },
        { name: "collect_shard", entrypoint: "collect_shard" },
        { name: "open_door", entrypoint: "open_door" },
        
        // State query methods
        { name: "get_player_state", entrypoint: "get_player_state" },
        { name: "get_room_state", entrypoint: "get_room_state" },
        { name: "get_entities_in_location", entrypoint: "get_entities_in_location" },
        { name: "get_available_doorways", entrypoint: "get_available_doorways" },
        { name: "get_game_status", entrypoint: "get_game_status" },
        { name: "get_turn_history", entrypoint: "get_turn_history" },
      ],
    },
  },
  events: {
    // Game lifecycle events
    "GameStarted": {
      player_id: "string",
      session_id: "felt252",
      start_time: "u64",
      starting_room_id: "u32",
    },
    "GameCompleted": {
      player_id: "string",
      session_id: "felt252",
      rooms_cleared: "u32",
      result: "GameResult",
      total_turns: "u32",
    },
    "VictoryAchieved": {
      player_id: "string",
      session_id: "felt252",
      completion_time: "u64",
      total_turns: "u32",
    },
    
    // Turn and action events
    "TurnExecuted": {
      player_id: "string",
      turn_id: "felt252",
      turn_number: "u32",
      actions_attempted: "u32",
      actions_successful: "u32",
      total_damage_dealt: "u32",
      total_damage_taken: "u32",
      shards_gained: "u32",
      numbered_shards_gained: "u32",
      position_end: "Position",
    },
    "ActionExecuted": {
      player_id: "string",
      turn_id: "felt252",
      action_index: "u32",
      action_type: "ActionType",
      success: "bool",
      damage_dealt: "u32",
      damage_taken: "u32",
      position_changed: "bool",
      door_opened: "bool",
    },
    
    // Gameplay events
    "PlayerDeath": {
      player_id: "string",
      position: "Position",
      cause: "felt252",
      turn_number: "u32",
    },
    "RoomCleared": {
      player_id: "string",
      room_id: "u32",
      entities_defeated: "u32",
      turn_number: "u32",
    },
    "NumberedShardCollected": {
      player_id: "string",
      shard_type: "NumberedShard",
      position: "Position",
      turn_number: "u32",
    },
  },
  models: {
    // Core game models
    "Player": {
      player_id: "ContractAddress",
      position: "Position",
      health: "u32",
      max_health: "u32",
      shards: "u32",
      game_active: "bool",
      is_alive: "bool",
      current_session_id: "felt252",
      rooms_cleared: "u32",
      turn_number: "u32",
      dodge_active_turns: "u32",
      has_shard_one: "bool",
      has_shard_two: "bool",
      has_shard_three: "bool",
      entered_door_id: "Option<u32>",
      door_enemy_alive: "bool",
      movement_locked: "bool",
      special_ability_cooldown: "u32",
      has_key: "bool",
    },
    "PlayerStats": {
      player_id: "ContractAddress",
      games_played: "u32",
      games_won: "u32",
      total_shards_collected: "u32",
      total_entities_defeated: "u32",
      total_playtime: "u64",
      best_completion_time: "u64",
      highest_room_reached: "u32",
      total_damage_dealt: "u32",
      total_damage_taken: "u32",
      doors_opened: "u32",
      total_turns_played: "u32",
      total_actions_taken: "u32",
      numbered_shards_collected: "u32",
    },
    "GameSession": {
      session_id: "felt252",
      player_id: "ContractAddress",
      start_time: "u64",
      end_time: "u64",
      rooms_cleared: "u32",
      total_shards_collected: "u32",
      numbered_shards_collected: "u32",
      entities_defeated: "u32",
      total_damage_dealt: "u32",
      total_damage_taken: "u32",
      doors_opened: "u32",
      deaths: "u32",
      session_complete: "bool",
      total_turns: "u32",
      total_actions: "u32",
      victory_achieved: "bool",
    },
    "GameConfig": {
      config_id: "felt252",
      grid_size: "u32",
      starting_health: "u32",
      starting_shards: "u32",
      base_damage: "u32",
      max_actions_per_turn: "u32",
      door_count: "u32",
      entity_spawn_rate: "u32",
      shard_drop_rate: "u32",
      rooms_for_victory: "u32",
      dodge_cooldown: "u32",
    },
    "TurnExecution": {
      turn_id: "felt252",
      player_id: "ContractAddress",
      session_id: "felt252",
      actions_count: "u32",
      successful_actions: "u32",
      total_damage_dealt: "u32",
      total_damage_taken: "u32",
      total_shards_gained: "u32",
      numbered_shards_collected: "u32",
      timestamp: "u64",
      turn_number: "u32",
    },
    
    // World models
    "Room": {
      room_id: "u32",
      initialized: "bool",
      cleared: "bool",
      entity_count: "u32",
      active_entities: "u32",
      has_treasure: "bool",
      treasure_collected: "bool",
      door_count: "u32",
      boundaries: "GridBounds",
    },
    "Door": {
      door_id: "u32",
      position: "Position",
      room_id: "u32",
      connected_room_id: "u32",
      is_open: "bool",
      requires_key: "bool",
      requires_cleared: "bool",
    },
    "Doorway": {
      doorway_id: "u32",
      position: "Position",
      room_id: "u32",
      connected_room_id: "u32",
      is_open: "bool",
      requires_cleared: "bool",
    },
    "Entity": {
      entity_id: "felt252",
      entity_type: "EntityType",
      position: "Position",
      health: "u32",
      max_health: "u32",
      is_alive: "bool",
      damage_per_turn: "u32",
      drops_numbered_shard: "Option<NumberedShard>",
      spawned_from_door: "bool",
    },
    "EntityState": {
      entity_id: "felt252",
      alert_level: "AlertLevel",
      detection_range: "u32",
      last_seen_player_pos: "Position",
      patrol_path_index: "u32",
      last_action_block: "u64",
    },
    "ShardLocation": {
      location_id: "felt252",
      position: "Position",
      numbered_shard: "Option<NumberedShard>",
      collected: "bool",
    },
    
    // Utility models
    "Position": {
      x: "u32",
      y: "u32",
      location_id: "u32",
    },
    "GridBounds": {
      min_x: "u32",
      max_x: "u32",
      min_y: "u32",
      max_y: "u32",
    },
  },
  enums: {
    "EntityType": ["Male", "Female"],
    "AlertLevel": ["Idle", "Alerted", "Combat"],
    "GameResult": ["InProgress", "Victory", "Defeat"],
    "NumberedShard": ["One", "Two", "Three"],
    "ActionType": ["Move", "OpenDoor", "Attack", "CollectShard"],
  },
};

const options: ControllerOptions = {
  chains: [{ rpcUrl: getRpcUrl() }],
  defaultChainId: getDefaultChainId(),
  policies,
  namespace: "blockrooms",
  slot: "blockrooms-game",
};

const cartridgeConnector = new ControllerConnector(
  options,
) as never as Connector;

export default cartridgeConnector;
