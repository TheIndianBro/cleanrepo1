import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { CairoCustomEnum, CairoOption, CairoOptionVariant, BigNumberish } from 'starknet';

// Type definition for `blockrooms::models::Door` struct
export interface Door {
	door_id: BigNumberish;
	position: Position;
	room_id: BigNumberish;
	connected_room_id: BigNumberish;
	is_open: boolean;
	requires_key: boolean;
	requires_cleared: boolean;
}

// Type definition for `blockrooms::models::DoorValue` struct
export interface DoorValue {
	position: Position;
	room_id: BigNumberish;
	connected_room_id: BigNumberish;
	is_open: boolean;
	requires_key: boolean;
	requires_cleared: boolean;
}

// Type definition for `blockrooms::models::Doorway` struct
export interface Doorway {
	doorway_id: BigNumberish;
	position: Position;
	room_id: BigNumberish;
	connected_room_id: BigNumberish;
	is_open: boolean;
	requires_cleared: boolean;
}

// Type definition for `blockrooms::models::DoorwayValue` struct
export interface DoorwayValue {
	position: Position;
	room_id: BigNumberish;
	connected_room_id: BigNumberish;
	is_open: boolean;
	requires_cleared: boolean;
}

// Type definition for `blockrooms::models::Entity` struct
export interface Entity {
	entity_id: BigNumberish;
	entity_type: EntityTypeEnum;
	position: Position;
	health: BigNumberish;
	max_health: BigNumberish;
	is_alive: boolean;
	damage_per_turn: BigNumberish;
	drops_numbered_shard: CairoOption<NumberedShardEnum>;
	spawned_from_door: boolean;
}

// Type definition for `blockrooms::models::EntityState` struct
export interface EntityState {
	entity_id: BigNumberish;
	alert_level: AlertLevelEnum;
	detection_range: BigNumberish;
	last_seen_player_pos: Position;
	patrol_path_index: BigNumberish;
	last_action_block: BigNumberish;
}

// Type definition for `blockrooms::models::EntityStateValue` struct
export interface EntityStateValue {
	alert_level: AlertLevelEnum;
	detection_range: BigNumberish;
	last_seen_player_pos: Position;
	patrol_path_index: BigNumberish;
	last_action_block: BigNumberish;
}

// Type definition for `blockrooms::models::EntityValue` struct
export interface EntityValue {
	entity_type: EntityTypeEnum;
	position: Position;
	health: BigNumberish;
	max_health: BigNumberish;
	is_alive: boolean;
	damage_per_turn: BigNumberish;
	drops_numbered_shard: CairoOption<NumberedShardEnum>;
	spawned_from_door: boolean;
}

// Type definition for `blockrooms::models::GameConfig` struct
export interface GameConfig {
	config_id: BigNumberish;
	grid_size: BigNumberish;
	starting_health: BigNumberish;
	starting_shards: BigNumberish;
	base_damage: BigNumberish;
	max_actions_per_turn: BigNumberish;
	door_count: BigNumberish;
	entity_spawn_rate: BigNumberish;
	shard_drop_rate: BigNumberish;
	rooms_for_victory: BigNumberish;
	dodge_cooldown: BigNumberish;
}

// Type definition for `blockrooms::models::GameConfigValue` struct
export interface GameConfigValue {
	grid_size: BigNumberish;
	starting_health: BigNumberish;
	starting_shards: BigNumberish;
	base_damage: BigNumberish;
	max_actions_per_turn: BigNumberish;
	door_count: BigNumberish;
	entity_spawn_rate: BigNumberish;
	shard_drop_rate: BigNumberish;
	rooms_for_victory: BigNumberish;
	dodge_cooldown: BigNumberish;
}

// Type definition for `blockrooms::models::GameSession` struct
export interface GameSession {
	session_id: BigNumberish;
	player_id: string;
	start_time: BigNumberish;
	end_time: BigNumberish;
	rooms_cleared: BigNumberish;
	total_shards_collected: BigNumberish;
	numbered_shards_collected: BigNumberish;
	entities_defeated: BigNumberish;
	total_damage_dealt: BigNumberish;
	total_damage_taken: BigNumberish;
	doors_opened: BigNumberish;
	deaths: BigNumberish;
	session_complete: boolean;
	total_turns: BigNumberish;
	total_actions: BigNumberish;
	victory_achieved: boolean;
}

// Type definition for `blockrooms::models::GameSessionValue` struct
export interface GameSessionValue {
	player_id: string;
	start_time: BigNumberish;
	end_time: BigNumberish;
	rooms_cleared: BigNumberish;
	total_shards_collected: BigNumberish;
	numbered_shards_collected: BigNumberish;
	entities_defeated: BigNumberish;
	total_damage_dealt: BigNumberish;
	total_damage_taken: BigNumberish;
	doors_opened: BigNumberish;
	deaths: BigNumberish;
	session_complete: boolean;
	total_turns: BigNumberish;
	total_actions: BigNumberish;
	victory_achieved: boolean;
}

// Type definition for `blockrooms::models::GridBounds` struct
export interface GridBounds {
	min_x: BigNumberish;
	max_x: BigNumberish;
	min_y: BigNumberish;
	max_y: BigNumberish;
}

// Type definition for `blockrooms::models::Player` struct
export interface Player {
	player_id: string;
	position: Position;
	health: BigNumberish;
	max_health: BigNumberish;
	shards: BigNumberish;
	game_active: boolean;
	is_alive: boolean;
	current_session_id: BigNumberish;
	rooms_cleared: BigNumberish;
	turn_number: BigNumberish;
	dodge_active_turns: BigNumberish;
	has_shard_one: boolean;
	has_shard_two: boolean;
	has_shard_three: boolean;
	entered_door_id: CairoOption<BigNumberish>;
	door_enemy_alive: boolean;
	movement_locked: boolean;
	special_ability_cooldown: BigNumberish;
	has_key: boolean;
}

// Type definition for `blockrooms::models::PlayerStats` struct
export interface PlayerStats {
	player_id: string;
	games_played: BigNumberish;
	games_won: BigNumberish;
	total_shards_collected: BigNumberish;
	total_entities_defeated: BigNumberish;
	total_playtime: BigNumberish;
	best_completion_time: BigNumberish;
	highest_room_reached: BigNumberish;
	total_damage_dealt: BigNumberish;
	total_damage_taken: BigNumberish;
	doors_opened: BigNumberish;
	total_turns_played: BigNumberish;
	total_actions_taken: BigNumberish;
	numbered_shards_collected: BigNumberish;
}

// Type definition for `blockrooms::models::PlayerStatsValue` struct
export interface PlayerStatsValue {
	games_played: BigNumberish;
	games_won: BigNumberish;
	total_shards_collected: BigNumberish;
	total_entities_defeated: BigNumberish;
	total_playtime: BigNumberish;
	best_completion_time: BigNumberish;
	highest_room_reached: BigNumberish;
	total_damage_dealt: BigNumberish;
	total_damage_taken: BigNumberish;
	doors_opened: BigNumberish;
	total_turns_played: BigNumberish;
	total_actions_taken: BigNumberish;
	numbered_shards_collected: BigNumberish;
}

// Type definition for `blockrooms::models::PlayerValue` struct
export interface PlayerValue {
	position: Position;
	health: BigNumberish;
	max_health: BigNumberish;
	shards: BigNumberish;
	game_active: boolean;
	is_alive: boolean;
	current_session_id: BigNumberish;
	rooms_cleared: BigNumberish;
	turn_number: BigNumberish;
	dodge_active_turns: BigNumberish;
	has_shard_one: boolean;
	has_shard_two: boolean;
	has_shard_three: boolean;
	entered_door_id: CairoOption<BigNumberish>;
	door_enemy_alive: boolean;
	movement_locked: boolean;
	special_ability_cooldown: BigNumberish;
	has_key: boolean;
}

// Type definition for `blockrooms::models::Position` struct
export interface Position {
	x: BigNumberish;
	y: BigNumberish;
	location_id: BigNumberish;
}

// Type definition for `blockrooms::models::Room` struct
export interface Room {
	room_id: BigNumberish;
	initialized: boolean;
	cleared: boolean;
	entity_count: BigNumberish;
	active_entities: BigNumberish;
	has_treasure: boolean;
	treasure_collected: boolean;
	door_count: BigNumberish;
	boundaries: GridBounds;
}

// Type definition for `blockrooms::models::RoomValue` struct
export interface RoomValue {
	initialized: boolean;
	cleared: boolean;
	entity_count: BigNumberish;
	active_entities: BigNumberish;
	has_treasure: boolean;
	treasure_collected: boolean;
	door_count: BigNumberish;
	boundaries: GridBounds;
}

// Type definition for `blockrooms::models::ShardLocation` struct
export interface ShardLocation {
	location_id: BigNumberish;
	position: Position;
	numbered_shard: CairoOption<NumberedShardEnum>;
	collected: boolean;
}

// Type definition for `blockrooms::models::ShardLocationValue` struct
export interface ShardLocationValue {
	position: Position;
	numbered_shard: CairoOption<NumberedShardEnum>;
	collected: boolean;
}

// Type definition for `blockrooms::models::TurnExecution` struct
export interface TurnExecution {
	turn_id: BigNumberish;
	player_id: string;
	session_id: BigNumberish;
	actions_count: BigNumberish;
	successful_actions: BigNumberish;
	total_damage_dealt: BigNumberish;
	total_damage_taken: BigNumberish;
	total_shards_gained: BigNumberish;
	numbered_shards_collected: BigNumberish;
	timestamp: BigNumberish;
	turn_number: BigNumberish;
}

// Type definition for `blockrooms::models::TurnExecutionValue` struct
export interface TurnExecutionValue {
	player_id: string;
	session_id: BigNumberish;
	actions_count: BigNumberish;
	successful_actions: BigNumberish;
	total_damage_dealt: BigNumberish;
	total_damage_taken: BigNumberish;
	total_shards_gained: BigNumberish;
	numbered_shards_collected: BigNumberish;
	timestamp: BigNumberish;
	turn_number: BigNumberish;
}

// Type definition for `blockrooms::systems::actions::actions::ActionExecuted` struct
export interface ActionExecuted {
	player_id: string;
	turn_id: BigNumberish;
	action_index: BigNumberish;
	action_type: ActionTypeEnum;
	success: boolean;
	damage_dealt: BigNumberish;
	damage_taken: BigNumberish;
	position_changed: boolean;
	door_opened: boolean;
}

// Type definition for `blockrooms::systems::actions::actions::ActionExecutedValue` struct
export interface ActionExecutedValue {
	turn_id: BigNumberish;
	action_index: BigNumberish;
	action_type: ActionTypeEnum;
	success: boolean;
	damage_dealt: BigNumberish;
	damage_taken: BigNumberish;
	position_changed: boolean;
	door_opened: boolean;
}

// Type definition for `blockrooms::systems::actions::actions::GameCompleted` struct
export interface GameCompleted {
	player_id: string;
	session_id: BigNumberish;
	rooms_cleared: BigNumberish;
	result: GameResultEnum;
	total_turns: BigNumberish;
}

// Type definition for `blockrooms::systems::actions::actions::GameCompletedValue` struct
export interface GameCompletedValue {
	session_id: BigNumberish;
	rooms_cleared: BigNumberish;
	result: GameResultEnum;
	total_turns: BigNumberish;
}

// Type definition for `blockrooms::systems::actions::actions::GameStarted` struct
export interface GameStarted {
	player_id: string;
	session_id: BigNumberish;
	start_time: BigNumberish;
	starting_room_id: BigNumberish;
}

// Type definition for `blockrooms::systems::actions::actions::GameStartedValue` struct
export interface GameStartedValue {
	session_id: BigNumberish;
	start_time: BigNumberish;
	starting_room_id: BigNumberish;
}

// Type definition for `blockrooms::systems::actions::actions::NumberedShardCollected` struct
export interface NumberedShardCollected {
	player_id: string;
	shard_type: NumberedShardEnum;
	position: Position;
	turn_number: BigNumberish;
}

// Type definition for `blockrooms::systems::actions::actions::NumberedShardCollectedValue` struct
export interface NumberedShardCollectedValue {
	shard_type: NumberedShardEnum;
	position: Position;
	turn_number: BigNumberish;
}

// Type definition for `blockrooms::systems::actions::actions::PlayerDeath` struct
export interface PlayerDeath {
	player_id: string;
	position: Position;
	cause: BigNumberish;
	turn_number: BigNumberish;
}

// Type definition for `blockrooms::systems::actions::actions::PlayerDeathValue` struct
export interface PlayerDeathValue {
	position: Position;
	cause: BigNumberish;
	turn_number: BigNumberish;
}

// Type definition for `blockrooms::systems::actions::actions::RoomCleared` struct
export interface RoomCleared {
	player_id: string;
	room_id: BigNumberish;
	entities_defeated: BigNumberish;
	turn_number: BigNumberish;
}

// Type definition for `blockrooms::systems::actions::actions::RoomClearedValue` struct
export interface RoomClearedValue {
	room_id: BigNumberish;
	entities_defeated: BigNumberish;
	turn_number: BigNumberish;
}

// Type definition for `blockrooms::systems::actions::actions::TurnExecuted` struct
export interface TurnExecuted {
	player_id: string;
	turn_id: BigNumberish;
	turn_number: BigNumberish;
	actions_attempted: BigNumberish;
	actions_successful: BigNumberish;
	total_damage_dealt: BigNumberish;
	total_damage_taken: BigNumberish;
	shards_gained: BigNumberish;
	numbered_shards_gained: BigNumberish;
	position_end: Position;
}

// Type definition for `blockrooms::systems::actions::actions::TurnExecutedValue` struct
export interface TurnExecutedValue {
	turn_id: BigNumberish;
	turn_number: BigNumberish;
	actions_attempted: BigNumberish;
	actions_successful: BigNumberish;
	total_damage_dealt: BigNumberish;
	total_damage_taken: BigNumberish;
	shards_gained: BigNumberish;
	numbered_shards_gained: BigNumberish;
	position_end: Position;
}

// Type definition for `blockrooms::systems::actions::actions::VictoryAchieved` struct
export interface VictoryAchieved {
	player_id: string;
	session_id: BigNumberish;
	completion_time: BigNumberish;
	total_turns: BigNumberish;
}

// Type definition for `blockrooms::systems::actions::actions::VictoryAchievedValue` struct
export interface VictoryAchievedValue {
	session_id: BigNumberish;
	completion_time: BigNumberish;
	total_turns: BigNumberish;
}

// Type definition for `blockrooms::models::AlertLevel` enum
export const alertLevel = [
	'Idle',
	'Alerted',
	'Combat',
] as const;
export type AlertLevel = { [key in typeof alertLevel[number]]: string };
export type AlertLevelEnum = CairoCustomEnum;

// Type definition for `blockrooms::models::EntityType` enum
export const entityType = [
	'Male',
	'Female',
] as const;
export type EntityType = { [key in typeof entityType[number]]: string };
export type EntityTypeEnum = CairoCustomEnum;

// Type definition for `blockrooms::models::NumberedShard` enum
export const numberedShard = [
	'One',
	'Two',
	'Three',
] as const;
export type NumberedShard = { [key in typeof numberedShard[number]]: string };
export type NumberedShardEnum = CairoCustomEnum;

// Type definition for `blockrooms::models::ActionType` enum
export const actionType = [
	'Move',
	'OpenDoor',
	'Attack',
	'CollectShard',
] as const;
export type ActionType = { [key in typeof actionType[number]]: string };
export type ActionTypeEnum = CairoCustomEnum;

// Type definition for `blockrooms::models::GameResult` enum
export const gameResult = [
	'InProgress',
	'Victory',
	'Defeat',
] as const;
export type GameResult = { [key in typeof gameResult[number]]: string };
export type GameResultEnum = CairoCustomEnum;

export interface SchemaType extends ISchemaType {
	blockrooms: {
		Door: Door,
		DoorValue: DoorValue,
		Doorway: Doorway,
		DoorwayValue: DoorwayValue,
		Entity: Entity,
		EntityState: EntityState,
		EntityStateValue: EntityStateValue,
		EntityValue: EntityValue,
		GameConfig: GameConfig,
		GameConfigValue: GameConfigValue,
		GameSession: GameSession,
		GameSessionValue: GameSessionValue,
		GridBounds: GridBounds,
		Player: Player,
		PlayerStats: PlayerStats,
		PlayerStatsValue: PlayerStatsValue,
		PlayerValue: PlayerValue,
		Position: Position,
		Room: Room,
		RoomValue: RoomValue,
		ShardLocation: ShardLocation,
		ShardLocationValue: ShardLocationValue,
		TurnExecution: TurnExecution,
		TurnExecutionValue: TurnExecutionValue,
		ActionExecuted: ActionExecuted,
		ActionExecutedValue: ActionExecutedValue,
		GameCompleted: GameCompleted,
		GameCompletedValue: GameCompletedValue,
		GameStarted: GameStarted,
		GameStartedValue: GameStartedValue,
		NumberedShardCollected: NumberedShardCollected,
		NumberedShardCollectedValue: NumberedShardCollectedValue,
		PlayerDeath: PlayerDeath,
		PlayerDeathValue: PlayerDeathValue,
		RoomCleared: RoomCleared,
		RoomClearedValue: RoomClearedValue,
		TurnExecuted: TurnExecuted,
		TurnExecutedValue: TurnExecutedValue,
		VictoryAchieved: VictoryAchieved,
		VictoryAchievedValue: VictoryAchievedValue,
	},
}
export const schema: SchemaType = {
	blockrooms: {
		Door: {
			door_id: 0,
		position: { x: 0, y: 0, location_id: 0, },
			room_id: 0,
			connected_room_id: 0,
			is_open: false,
			requires_key: false,
			requires_cleared: false,
		},
		DoorValue: {
		position: { x: 0, y: 0, location_id: 0, },
			room_id: 0,
			connected_room_id: 0,
			is_open: false,
			requires_key: false,
			requires_cleared: false,
		},
		Doorway: {
			doorway_id: 0,
		position: { x: 0, y: 0, location_id: 0, },
			room_id: 0,
			connected_room_id: 0,
			is_open: false,
			requires_cleared: false,
		},
		DoorwayValue: {
		position: { x: 0, y: 0, location_id: 0, },
			room_id: 0,
			connected_room_id: 0,
			is_open: false,
			requires_cleared: false,
		},
		Entity: {
			entity_id: 0,
		entity_type: new CairoCustomEnum({ 
					Male: "",
				Female: undefined, }),
		position: { x: 0, y: 0, location_id: 0, },
			health: 0,
			max_health: 0,
			is_alive: false,
			damage_per_turn: 0,
		drops_numbered_shard: new CairoOption(CairoOptionVariant.None),
			spawned_from_door: false,
		},
		EntityState: {
			entity_id: 0,
		alert_level: new CairoCustomEnum({ 
					Idle: "",
				Alerted: undefined,
				Combat: undefined, }),
			detection_range: 0,
		last_seen_player_pos: { x: 0, y: 0, location_id: 0, },
			patrol_path_index: 0,
			last_action_block: 0,
		},
		EntityStateValue: {
		alert_level: new CairoCustomEnum({ 
					Idle: "",
				Alerted: undefined,
				Combat: undefined, }),
			detection_range: 0,
		last_seen_player_pos: { x: 0, y: 0, location_id: 0, },
			patrol_path_index: 0,
			last_action_block: 0,
		},
		EntityValue: {
		entity_type: new CairoCustomEnum({ 
					Male: "",
				Female: undefined, }),
		position: { x: 0, y: 0, location_id: 0, },
			health: 0,
			max_health: 0,
			is_alive: false,
			damage_per_turn: 0,
		drops_numbered_shard: new CairoOption(CairoOptionVariant.None),
			spawned_from_door: false,
		},
		GameConfig: {
			config_id: 0,
			grid_size: 0,
			starting_health: 0,
			starting_shards: 0,
			base_damage: 0,
			max_actions_per_turn: 0,
			door_count: 0,
			entity_spawn_rate: 0,
			shard_drop_rate: 0,
			rooms_for_victory: 0,
			dodge_cooldown: 0,
		},
		GameConfigValue: {
			grid_size: 0,
			starting_health: 0,
			starting_shards: 0,
			base_damage: 0,
			max_actions_per_turn: 0,
			door_count: 0,
			entity_spawn_rate: 0,
			shard_drop_rate: 0,
			rooms_for_victory: 0,
			dodge_cooldown: 0,
		},
		GameSession: {
			session_id: 0,
			player_id: "",
			start_time: 0,
			end_time: 0,
			rooms_cleared: 0,
			total_shards_collected: 0,
			numbered_shards_collected: 0,
			entities_defeated: 0,
			total_damage_dealt: 0,
			total_damage_taken: 0,
			doors_opened: 0,
			deaths: 0,
			session_complete: false,
			total_turns: 0,
			total_actions: 0,
			victory_achieved: false,
		},
		GameSessionValue: {
			player_id: "",
			start_time: 0,
			end_time: 0,
			rooms_cleared: 0,
			total_shards_collected: 0,
			numbered_shards_collected: 0,
			entities_defeated: 0,
			total_damage_dealt: 0,
			total_damage_taken: 0,
			doors_opened: 0,
			deaths: 0,
			session_complete: false,
			total_turns: 0,
			total_actions: 0,
			victory_achieved: false,
		},
		GridBounds: {
			min_x: 0,
			max_x: 0,
			min_y: 0,
			max_y: 0,
		},
		Player: {
			player_id: "",
		position: { x: 0, y: 0, location_id: 0, },
			health: 0,
			max_health: 0,
			shards: 0,
			game_active: false,
			is_alive: false,
			current_session_id: 0,
			rooms_cleared: 0,
			turn_number: 0,
			dodge_active_turns: 0,
			has_shard_one: false,
			has_shard_two: false,
			has_shard_three: false,
		entered_door_id: new CairoOption(CairoOptionVariant.None),
			door_enemy_alive: false,
			movement_locked: false,
			special_ability_cooldown: 0,
			has_key: false,
		},
		PlayerStats: {
			player_id: "",
			games_played: 0,
			games_won: 0,
			total_shards_collected: 0,
			total_entities_defeated: 0,
			total_playtime: 0,
			best_completion_time: 0,
			highest_room_reached: 0,
			total_damage_dealt: 0,
			total_damage_taken: 0,
			doors_opened: 0,
			total_turns_played: 0,
			total_actions_taken: 0,
			numbered_shards_collected: 0,
		},
		PlayerStatsValue: {
			games_played: 0,
			games_won: 0,
			total_shards_collected: 0,
			total_entities_defeated: 0,
			total_playtime: 0,
			best_completion_time: 0,
			highest_room_reached: 0,
			total_damage_dealt: 0,
			total_damage_taken: 0,
			doors_opened: 0,
			total_turns_played: 0,
			total_actions_taken: 0,
			numbered_shards_collected: 0,
		},
		PlayerValue: {
		position: { x: 0, y: 0, location_id: 0, },
			health: 0,
			max_health: 0,
			shards: 0,
			game_active: false,
			is_alive: false,
			current_session_id: 0,
			rooms_cleared: 0,
			turn_number: 0,
			dodge_active_turns: 0,
			has_shard_one: false,
			has_shard_two: false,
			has_shard_three: false,
		entered_door_id: new CairoOption(CairoOptionVariant.None),
			door_enemy_alive: false,
			movement_locked: false,
			special_ability_cooldown: 0,
			has_key: false,
		},
		Position: {
			x: 0,
			y: 0,
			location_id: 0,
		},
		Room: {
			room_id: 0,
			initialized: false,
			cleared: false,
			entity_count: 0,
			active_entities: 0,
			has_treasure: false,
			treasure_collected: false,
			door_count: 0,
		boundaries: { min_x: 0, max_x: 0, min_y: 0, max_y: 0, },
		},
		RoomValue: {
			initialized: false,
			cleared: false,
			entity_count: 0,
			active_entities: 0,
			has_treasure: false,
			treasure_collected: false,
			door_count: 0,
		boundaries: { min_x: 0, max_x: 0, min_y: 0, max_y: 0, },
		},
		ShardLocation: {
			location_id: 0,
		position: { x: 0, y: 0, location_id: 0, },
		numbered_shard: new CairoOption(CairoOptionVariant.None),
			collected: false,
		},
		ShardLocationValue: {
		position: { x: 0, y: 0, location_id: 0, },
		numbered_shard: new CairoOption(CairoOptionVariant.None),
			collected: false,
		},
		TurnExecution: {
			turn_id: 0,
			player_id: "",
			session_id: 0,
			actions_count: 0,
			successful_actions: 0,
			total_damage_dealt: 0,
			total_damage_taken: 0,
			total_shards_gained: 0,
			numbered_shards_collected: 0,
			timestamp: 0,
			turn_number: 0,
		},
		TurnExecutionValue: {
			player_id: "",
			session_id: 0,
			actions_count: 0,
			successful_actions: 0,
			total_damage_dealt: 0,
			total_damage_taken: 0,
			total_shards_gained: 0,
			numbered_shards_collected: 0,
			timestamp: 0,
			turn_number: 0,
		},
		ActionExecuted: {
			player_id: "",
			turn_id: 0,
			action_index: 0,
		action_type: new CairoCustomEnum({ 
					Move: "",
				OpenDoor: undefined,
				Attack: undefined,
				CollectShard: undefined, }),
			success: false,
			damage_dealt: 0,
			damage_taken: 0,
			position_changed: false,
			door_opened: false,
		},
		ActionExecutedValue: {
			turn_id: 0,
			action_index: 0,
		action_type: new CairoCustomEnum({ 
					Move: "",
				OpenDoor: undefined,
				Attack: undefined,
				CollectShard: undefined, }),
			success: false,
			damage_dealt: 0,
			damage_taken: 0,
			position_changed: false,
			door_opened: false,
		},
		GameCompleted: {
			player_id: "",
			session_id: 0,
			rooms_cleared: 0,
		result: new CairoCustomEnum({ 
					InProgress: "",
				Victory: undefined,
				Defeat: undefined, }),
			total_turns: 0,
		},
		GameCompletedValue: {
			session_id: 0,
			rooms_cleared: 0,
		result: new CairoCustomEnum({ 
					InProgress: "",
				Victory: undefined,
				Defeat: undefined, }),
			total_turns: 0,
		},
		GameStarted: {
			player_id: "",
			session_id: 0,
			start_time: 0,
			starting_room_id: 0,
		},
		GameStartedValue: {
			session_id: 0,
			start_time: 0,
			starting_room_id: 0,
		},
		NumberedShardCollected: {
			player_id: "",
		shard_type: new CairoCustomEnum({ 
					One: "",
				Two: undefined,
				Three: undefined, }),
		position: { x: 0, y: 0, location_id: 0, },
			turn_number: 0,
		},
		NumberedShardCollectedValue: {
		shard_type: new CairoCustomEnum({ 
					One: "",
				Two: undefined,
				Three: undefined, }),
		position: { x: 0, y: 0, location_id: 0, },
			turn_number: 0,
		},
		PlayerDeath: {
			player_id: "",
		position: { x: 0, y: 0, location_id: 0, },
			cause: 0,
			turn_number: 0,
		},
		PlayerDeathValue: {
		position: { x: 0, y: 0, location_id: 0, },
			cause: 0,
			turn_number: 0,
		},
		RoomCleared: {
			player_id: "",
			room_id: 0,
			entities_defeated: 0,
			turn_number: 0,
		},
		RoomClearedValue: {
			room_id: 0,
			entities_defeated: 0,
			turn_number: 0,
		},
		TurnExecuted: {
			player_id: "",
			turn_id: 0,
			turn_number: 0,
			actions_attempted: 0,
			actions_successful: 0,
			total_damage_dealt: 0,
			total_damage_taken: 0,
			shards_gained: 0,
			numbered_shards_gained: 0,
		position_end: { x: 0, y: 0, location_id: 0, },
		},
		TurnExecutedValue: {
			turn_id: 0,
			turn_number: 0,
			actions_attempted: 0,
			actions_successful: 0,
			total_damage_dealt: 0,
			total_damage_taken: 0,
			shards_gained: 0,
			numbered_shards_gained: 0,
		position_end: { x: 0, y: 0, location_id: 0, },
		},
		VictoryAchieved: {
			player_id: "",
			session_id: 0,
			completion_time: 0,
			total_turns: 0,
		},
		VictoryAchievedValue: {
			session_id: 0,
			completion_time: 0,
			total_turns: 0,
		},
	},
};
export enum ModelsMapping {
	AlertLevel = 'blockrooms-AlertLevel',
	Door = 'blockrooms-Door',
	DoorValue = 'blockrooms-DoorValue',
	Doorway = 'blockrooms-Doorway',
	DoorwayValue = 'blockrooms-DoorwayValue',
	Entity = 'blockrooms-Entity',
	EntityState = 'blockrooms-EntityState',
	EntityStateValue = 'blockrooms-EntityStateValue',
	EntityType = 'blockrooms-EntityType',
	EntityValue = 'blockrooms-EntityValue',
	GameConfig = 'blockrooms-GameConfig',
	GameConfigValue = 'blockrooms-GameConfigValue',
	GameSession = 'blockrooms-GameSession',
	GameSessionValue = 'blockrooms-GameSessionValue',
	GridBounds = 'blockrooms-GridBounds',
	NumberedShard = 'blockrooms-NumberedShard',
	Player = 'blockrooms-Player',
	PlayerStats = 'blockrooms-PlayerStats',
	PlayerStatsValue = 'blockrooms-PlayerStatsValue',
	PlayerValue = 'blockrooms-PlayerValue',
	Position = 'blockrooms-Position',
	Room = 'blockrooms-Room',
	RoomValue = 'blockrooms-RoomValue',
	ShardLocation = 'blockrooms-ShardLocation',
	ShardLocationValue = 'blockrooms-ShardLocationValue',
	TurnExecution = 'blockrooms-TurnExecution',
	TurnExecutionValue = 'blockrooms-TurnExecutionValue',
	ActionType = 'blockrooms-ActionType',
	GameResult = 'blockrooms-GameResult',
	ActionExecuted = 'blockrooms-ActionExecuted',
	ActionExecutedValue = 'blockrooms-ActionExecutedValue',
	GameCompleted = 'blockrooms-GameCompleted',
	GameCompletedValue = 'blockrooms-GameCompletedValue',
	GameStarted = 'blockrooms-GameStarted',
	GameStartedValue = 'blockrooms-GameStartedValue',
	NumberedShardCollected = 'blockrooms-NumberedShardCollected',
	NumberedShardCollectedValue = 'blockrooms-NumberedShardCollectedValue',
	PlayerDeath = 'blockrooms-PlayerDeath',
	PlayerDeathValue = 'blockrooms-PlayerDeathValue',
	RoomCleared = 'blockrooms-RoomCleared',
	RoomClearedValue = 'blockrooms-RoomClearedValue',
	TurnExecuted = 'blockrooms-TurnExecuted',
	TurnExecutedValue = 'blockrooms-TurnExecutedValue',
	VictoryAchieved = 'blockrooms-VictoryAchieved',
	VictoryAchievedValue = 'blockrooms-VictoryAchievedValue',
}