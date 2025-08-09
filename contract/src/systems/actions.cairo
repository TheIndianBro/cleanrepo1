use blockrooms::models::{
    Action, ActionResult, ActionType, ActionValidation, AlertLevel, AttackAction,
    CollectShardAction, Door, DoorTrait, Doorway, DoorwayTrait, Entity, EntityState, EntityTrait,
    EntityType, GameConfig, GameConfigTrait, GameResult, GameSession, GameSessionTrait, GridBounds,
    MoveAction, NumberedShard, OpenDoorAction, Player, PlayerStats, PlayerStatsTrait, PlayerTrait,
    Position, PositionTrait, Room, RoomTrait, TransitionAction, TurnExecution,
};
use dojo::event::EventStorage;
use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use starknet::{ContractAddress, get_block_number, get_block_timestamp, get_caller_address};

#[starknet::interface]
pub trait IBlockRooms<T> {
    fn initialize_player(ref self: T);
    fn start_game(ref self: T);
    fn respawn_player(ref self: T);

    fn execute_turn(ref self: T, actions: Array<Action>);
    fn validate_actions(self: @T, actions: Array<Action>) -> Array<ActionValidation>;

    fn move_player(ref self: T, x_delta: i32, y_delta: i32);
    fn attack_entity(ref self: T, entity_id: felt252);
    fn collect_shard(ref self: T, position: Position);
    fn open_door(ref self: T, door_id: u32);

    fn get_player_state(self: @T) -> Player;
    fn get_room_state(self: @T, room_id: u32) -> Room;
    fn get_entities_in_location(self: @T, location_id: u32) -> Array<Entity>;
    fn get_available_doorways(self: @T, location_id: u32) -> Array<Doorway>;
    fn get_game_status(self: @T) -> GameResult;
    fn get_turn_history(self: @T, limit: u32) -> Array<TurnExecution>;
    fn end_game(ref self: T);
}

#[dojo::contract]
pub mod actions {
    use super::*;

    #[derive(Copy, Drop, Serde, Introspect)]
    #[dojo::event]
    pub struct TurnExecuted {
        #[key]
        pub player_id: ContractAddress,
        pub turn_id: felt252,
        pub turn_number: u32,
        pub actions_attempted: u32,
        pub actions_successful: u32,
        pub total_damage_dealt: u32,
        pub total_damage_taken: u32,
        pub shards_gained: u32,
        pub numbered_shards_gained: u32,
        pub position_end: Position,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct ActionExecuted {
        #[key]
        pub player_id: ContractAddress,
        pub turn_id: felt252,
        pub action_index: u32,
        pub action_type: ActionType,
        pub success: bool,
        pub damage_dealt: u32,
        pub damage_taken: u32,
        pub position_changed: bool,
        pub door_opened: bool,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct GameStarted {
        #[key]
        pub player_id: ContractAddress,
        pub session_id: felt252,
        pub start_time: u64,
        pub starting_room_id: u32,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct RoomCleared {
        #[key]
        pub player_id: ContractAddress,
        pub room_id: u32,
        pub entities_defeated: u32,
        pub turn_number: u32,
    }

    #[derive(Copy, Drop, Serde, Introspect)]
    #[dojo::event]
    pub struct PlayerDeath {
        #[key]
        pub player_id: ContractAddress,
        pub position: Position,
        pub cause: felt252,
        pub turn_number: u32,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct GameCompleted {
        #[key]
        pub player_id: ContractAddress,
        pub session_id: felt252,
        pub rooms_cleared: u32,
        pub result: GameResult,
        pub total_turns: u32,
    }

    #[derive(Copy, Drop, Serde)]
    #[dojo::event]
    pub struct VictoryAchieved {
        #[key]
        pub player_id: ContractAddress,
        pub session_id: felt252,
        pub completion_time: u64,
        pub total_turns: u32,
    }

    #[derive(Copy, Drop, Serde, Introspect)]
    #[dojo::event]
    pub struct NumberedShardCollected {
        #[key]
        pub player_id: ContractAddress,
        pub shard_type: NumberedShard,
        pub position: Position,
        pub turn_number: u32,
    }

    pub mod Errors {
        pub const GAME_NOT_ACTIVE: felt252 = 'game_not_active';
        pub const INVALID_MOVEMENT: felt252 = 'invalid_movement';
        pub const ENTITY_NOT_FOUND: felt252 = 'entity_not_found';
        pub const ENTITY_NOT_AT_POSITION: felt252 = 'entity_not_at_position';
        pub const INSUFFICIENT_SHARDS: felt252 = 'insufficient_shards';
        pub const DOOR_NOT_ACCESSIBLE: felt252 = 'door_not_accessible';
        pub const PLAYER_DEAD: felt252 = 'player_dead';
        pub const SHARD_NOT_FOUND: felt252 = 'shard_not_found';
        pub const ROOM_NOT_CLEARED: felt252 = 'room_not_cleared';
        pub const TOO_MANY_ACTIONS: felt252 = 'too_many_actions';
        pub const INVALID_ACTION_SEQUENCE: felt252 = 'invalid_action_sequence';
        pub const ACTION_VALIDATION_FAILED: felt252 = 'action_validation_failed';
        pub const MOVEMENT_LOCKED: felt252 = 'movement_locked';
        pub const INVALID_DELTA: felt252 = 'invalid_delta';
    }

    #[abi(embed_v0)]
    impl BlockRoomsImpl of IBlockRooms<ContractState> {
        fn initialize_player(ref self: ContractState) {
            let mut world = self.world_default();
            let player_id = get_caller_address();

            let existing_stats: PlayerStats = world.read_model(player_id);
            if existing_stats.games_played > 0 {
                return;
            }

            let player_stats = PlayerStatsTrait::new(player_id);
            world.write_model(@player_stats);

            let config_id = 'default';
            let existing_config: GameConfig = world.read_model(config_id);
            if existing_config.grid_size == 0 {
                let config = GameConfigTrait::default_config();
                world.write_model(@config);
            }
        }

        fn start_game(ref self: ContractState) {
            let mut world = self.world_default();
            let player_id = get_caller_address();

            let existing_player: Player = world.read_model(player_id);
            if existing_player.game_active {
                return;
            }

            let config: GameConfig = world.read_model('default');
            let session_id = self.generate_session_id(player_id);

            let player = PlayerTrait::new(player_id, session_id, config);
            world.write_model(@player);

            let game_session = GameSessionTrait::new(session_id, player_id, get_block_timestamp());
            world.write_model(@game_session);

            let starting_room_id = 1_u32;
            self.initialize_room(ref world, starting_room_id);

            let mut player_stats: PlayerStats = world.read_model(player_id);
            player_stats.start_game();
            world.write_model(@player_stats);

            world
                .emit_event(
                    @GameStarted {
                        player_id, session_id, start_time: get_block_timestamp(), starting_room_id,
                    },
                );
        }

        fn execute_turn(ref self: ContractState, actions: Array<Action>) {
            let mut world = self.world_default();
            let player_id = get_caller_address();
            let config: GameConfig = world.read_model('default');

            let mut player: Player = world.read_model(player_id);
            assert(player.game_active && player.is_alive, Errors::GAME_NOT_ACTIVE);
            assert(actions.len() <= config.max_actions_per_turn, Errors::TOO_MANY_ACTIONS);

            player.start_turn();
            let turn_id = self.generate_turn_id(player_id, player.turn_number);

            let validations = self.validate_actions_internal(@world, player, actions.span());
            self.ensure_all_actions_valid(validations.span());

            let mut turn_results = ArrayTrait::new();
            let mut successful_actions = 0;
            let mut total_damage_dealt = 0;
            let mut total_damage_taken = 0;
            let mut total_shards_gained = 0;
            let mut total_numbered_shards = 0;

            let mut i = 0;
            loop {
                if i >= actions.len() {
                    break;
                }

                let action = *actions.at(i);
                let result = self.execute_single_action(ref world, ref player, action, i);

                if result.success {
                    successful_actions += 1;
                }

                total_damage_dealt += result.damage_dealt;
                total_damage_taken += result.damage_taken;
                total_shards_gained += result.shards_gained;
                
                if result.numbered_shard.is_some() {
                    total_numbered_shards += 1;
                }

                turn_results.append(result);

                world
                    .emit_event(
                        @ActionExecuted {
                            player_id,
                            turn_id,
                            action_index: i,
                            action_type: result.action_type,
                            success: result.success,
                            damage_dealt: result.damage_dealt,
                            damage_taken: result.damage_taken,
                            position_changed: result.position_changed,
                            door_opened: result.door_opened,
                        },
                    );

                if result.game_won {
                    self.handle_victory(ref world, ref player);
                    break;
                }

                if !player.is_alive {
                    break;
                }

                i += 1;
            };

            self.process_end_of_turn_effects(ref world, ref player);

            let mut game_session: GameSession = world.read_model(player.current_session_id);
            let mut player_stats: PlayerStats = world.read_model(player_id);

            game_session.record_turn(actions.len());
            game_session.deal_damage(total_damage_dealt);
            game_session.take_damage(total_damage_taken);
            game_session.total_shards_collected += total_shards_gained;
            game_session.numbered_shards_collected += total_numbered_shards;

            player_stats.record_turn_played(actions.len());
            player_stats.record_damage_dealt(total_damage_dealt);
            player_stats.record_damage_taken(total_damage_taken);
            player_stats.add_shards_collected(total_shards_gained);
            player_stats.numbered_shards_collected += total_numbered_shards;

            let turn_execution = TurnExecution {
                turn_id,
                player_id,
                session_id: player.current_session_id,
                actions_count: actions.len(),
                successful_actions,
                total_damage_dealt,
                total_damage_taken,
                total_shards_gained,
                numbered_shards_collected: total_numbered_shards,
                timestamp: get_block_timestamp(),
                turn_number: player.turn_number,
            };

            world.write_model(@player);
            world.write_model(@game_session);
            world.write_model(@player_stats);
            world.write_model(@turn_execution);

            world
                .emit_event(
                    @TurnExecuted {
                        player_id,
                        turn_id,
                        turn_number: player.turn_number,
                        actions_attempted: actions.len(),
                        actions_successful: successful_actions,
                        total_damage_dealt,
                        total_damage_taken,
                        shards_gained: total_shards_gained,
                        numbered_shards_gained: total_numbered_shards,
                        position_end: player.position,
                    },
                );
        }

        fn validate_actions(self: @ContractState, actions: Array<Action>) -> Array<ActionValidation> {
            let world = self.world_default();
            let player_id = get_caller_address();
            let player: Player = world.read_model(player_id);

            self.validate_actions_internal(@world, player, actions.span())
        }

        fn move_player(ref self: ContractState, x_delta: i32, y_delta: i32) {
            let actions = array![Action::Move(MoveAction { x_delta, y_delta })];
            self.execute_turn(actions);
        }

        fn attack_entity(ref self: ContractState, entity_id: felt252) {
            let actions = array![Action::Attack(AttackAction { entity_id })];
            self.execute_turn(actions);
        }

        fn collect_shard(ref self: ContractState, position: Position) {
            let actions = array![
                Action::CollectShard(
                    CollectShardAction {
                        action_id: get_block_timestamp().into(),
                        position,
                    },
                ),
            ];
            self.execute_turn(actions);
        }

        fn open_door(ref self: ContractState, door_id: u32) {
            let actions = array![Action::OpenDoor(OpenDoorAction { door_id })];
            self.execute_turn(actions);
        }

        fn respawn_player(ref self: ContractState) {
            let mut world = self.world_default();
            let player_id = get_caller_address();

            let mut player: Player = world.read_model(player_id);
            let mut game_session: GameSession = world.read_model(player.current_session_id);

            assert(player.game_active && !player.is_alive, Errors::GAME_NOT_ACTIVE);

            let spawn_position = Position { x: 1, y: 1, location_id: 1 };
            player.respawn(spawn_position);
            game_session.record_death();

            world.write_model(@player);
            world.write_model(@game_session);
        }

        fn end_game(ref self: ContractState) {
            let mut world = self.world_default();
            let player_id = get_caller_address();

            let mut player: Player = world.read_model(player_id);
            let mut game_session: GameSession = world.read_model(player.current_session_id);
            let mut player_stats: PlayerStats = world.read_model(player_id);
            let config: GameConfig = world.read_model('default');

            assert(player.game_active, Errors::GAME_NOT_ACTIVE);

            let end_time = get_block_timestamp();
            let playtime = game_session.get_duration();

            game_session.end_session(end_time);
            player.end_game();

            let is_victory = game_session.is_victory(config.rooms_for_victory) || player.has_victory_condition();
            if is_victory {
                player_stats.complete_game(playtime, game_session.rooms_cleared);
                game_session.complete_with_victory(end_time);
            }

            player_stats.add_playtime(playtime);
            player_stats.add_shards_collected(game_session.total_shards_collected);

            world.write_model(@player);
            world.write_model(@game_session);
            world.write_model(@player_stats);

            let result = if is_victory { GameResult::Victory } else { GameResult::Defeat };

            world
                .emit_event(
                    @GameCompleted {
                        player_id,
                        session_id: game_session.session_id,
                        rooms_cleared: game_session.rooms_cleared,
                        result,
                        total_turns: game_session.total_turns,
                    },
                );
        }

        fn get_player_state(self: @ContractState) -> Player {
            let world = self.world_default();
            let player_id = get_caller_address();
            world.read_model(player_id)
        }

        fn get_room_state(self: @ContractState, room_id: u32) -> Room {
            let world = self.world_default();
            world.read_model(room_id)
        }

        fn get_entities_in_location(self: @ContractState, location_id: u32) -> Array<Entity> {
            ArrayTrait::new()
        }

        fn get_available_doorways(self: @ContractState, location_id: u32) -> Array<Doorway> {
            ArrayTrait::new()
        }

        fn get_game_status(self: @ContractState) -> GameResult {
            let world = self.world_default();
            let player_id = get_caller_address();
            let player: Player = world.read_model(player_id);
            let game_session: GameSession = world.read_model(player.current_session_id);
            let config: GameConfig = world.read_model('default');

            if !player.game_active {
                if player.has_victory_condition() || game_session.is_victory(config.rooms_for_victory) {
                    return GameResult::Victory;
                }
                return GameResult::Defeat;
            }
            GameResult::InProgress
        }

        fn get_turn_history(self: @ContractState, limit: u32) -> Array<TurnExecution> {
            ArrayTrait::new()
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> WorldStorage {
            self.world(@"blockrooms")
        }

        fn execute_single_action(
            self: @ContractState,
            ref world: WorldStorage,
            ref player: Player,
            action: Action,
            action_index: u32,
        ) -> ActionResult {
            match action {
                Action::Move(move_action) => {
                    self.execute_move_action(ref world, ref player, move_action)
                },
                Action::Attack(attack_action) => {
                    self.execute_attack_action(ref world, ref player, attack_action)
                },
                Action::CollectShard(collect_action) => {
                    self.execute_collect_shard_action(ref world, ref player, collect_action)
                },
                Action::OpenDoor(door_action) => {
                    self.execute_open_door_action(ref world, ref player, door_action)
                },
            }
        }

        fn execute_move_action(
            self: @ContractState,
            ref world: WorldStorage,
            ref player: Player,
            move_action: MoveAction,
        ) -> ActionResult {
            if move_action.x_delta < -1 || move_action.x_delta > 1 || 
               move_action.y_delta < -1 || move_action.y_delta > 1 {
                return ActionResult {
                    result_id: get_block_timestamp().into(),
                    action_type: ActionType::Move,
                    success: false,
                    error_code: Errors::INVALID_DELTA,
                    damage_dealt: 0,
                    damage_taken: 0,
                    shards_gained: 0,
                    numbered_shard: Option::None,
                    position_changed: false,
                    entity_defeated: false,
                    door_opened: false,
                    game_won: false,
                };
            }

            let old_position = player.position;
            let new_position = old_position.move_by_delta(move_action.x_delta, move_action.y_delta);

            if !self.is_valid_position_in_room(new_position) {
                return ActionResult {
                    result_id: get_block_timestamp().into(),
                    action_type: ActionType::Move,
                    success: false,
                    error_code: Errors::INVALID_MOVEMENT,
                    damage_dealt: 0,
                    damage_taken: 0,
                    shards_gained: 0,
                    numbered_shard: Option::None,
                    position_changed: false,
                    entity_defeated: false,
                    door_opened: false,
                    game_won: false,
                };
            }

            player.change_location(new_position);

            ActionResult {
                result_id: get_block_timestamp().into(),
                action_type: ActionType::Move,
                success: true,
                error_code: 0,
                damage_dealt: 0,
                damage_taken: 0,
                shards_gained: 0,
                numbered_shard: Option::None,
                position_changed: true,
                entity_defeated: false,
                door_opened: false,
                game_won: false,
            }
        }

        fn execute_attack_action(
            self: @ContractState,
            ref world: WorldStorage,
            ref player: Player,
            attack_action: AttackAction,
        ) -> ActionResult {
            let mut entity: Entity = world.read_model(attack_action.entity_id);

            if !entity.is_alive {
                return ActionResult {
                    result_id: get_block_timestamp().into(),
                    action_type: ActionType::Attack,
                    success: false,
                    error_code: Errors::ENTITY_NOT_FOUND,
                    damage_dealt: 0,
                    damage_taken: 0,
                    shards_gained: 0,
                    numbered_shard: Option::None,
                    position_changed: false,
                    entity_defeated: false,
                    door_opened: false,
                    game_won: false,
                };
            }

            if !entity.is_at_same_position(player.position) {
                return ActionResult {
                    result_id: get_block_timestamp().into(),
                    action_type: ActionType::Attack,
                    success: false,
                    error_code: Errors::ENTITY_NOT_AT_POSITION,
                    damage_dealt: 0,
                    damage_taken: 0,
                    shards_gained: 0,
                    numbered_shard: Option::None,
                    position_changed: false,
                    entity_defeated: false,
                    door_opened: false,
                    game_won: false,
                };
            }

            let config: GameConfig = world.read_model('default');
            let damage_dealt = config.get_base_damage(); 

            let entity_defeated = !entity.take_damage(damage_dealt);
            world.write_model(@entity);

            let mut damage_taken = 0;
            let mut numbered_shard_dropped = Option::None;
            
            if !entity_defeated {
                damage_taken = entity.damage_per_turn;
                let _ = player.take_damage(damage_taken);
            } else {
                let config: GameConfig = world.read_model('default');
                
                if self.should_drop_numbered_shard(config.shard_drop_rate) {
                    numbered_shard_dropped = Option::Some(self.get_random_numbered_shard());
                } else {
                    numbered_shard_dropped = Option::None;
                }
                
                if self.is_door_spawned_entity(attack_action.entity_id) {
                    player.defeat_door_enemy();
                }

                self.handle_entity_death(ref world, attack_action.entity_id, entity.position);

                let mut room: Room = world.read_model(entity.position.location_id);
                room.defeat_entity();
                world.write_model(@room);

                if room.is_cleared() {
                    player.clear_room();

                    world
                        .emit_event(
                            @RoomCleared {
                                player_id: player.player_id,
                                room_id: room.room_id,
                                entities_defeated: room.entity_count - room.active_entities,
                                turn_number: player.turn_number,
                            },
                        );
                }

                let mut game_session: GameSession = world.read_model(player.current_session_id);
                game_session.defeat_entity();
                world.write_model(@game_session);

                let mut player_stats: PlayerStats = world.read_model(player.player_id);
                player_stats.record_entity_defeat();
                world.write_model(@player_stats);
            }

            ActionResult {
                result_id: get_block_timestamp().into(),
                action_type: ActionType::Attack,
                success: true,
                error_code: 0,
                damage_dealt,
                damage_taken,
                shards_gained: 0,
                numbered_shard: numbered_shard_dropped,
                position_changed: false,
                entity_defeated,
                door_opened: false,
                game_won: false,
            }
        }

        fn execute_collect_shard_action(
            self: @ContractState,
            ref world: WorldStorage,
            ref player: Player,
            collect_action: CollectShardAction,
        ) -> ActionResult {
            if !player.position.is_same_location(collect_action.position) {
                return ActionResult {
                    result_id: get_block_timestamp().into(),
                    action_type: ActionType::CollectShard,
                    success: false,
                    error_code: Errors::SHARD_NOT_FOUND,
                    damage_dealt: 0,
                    damage_taken: 0,
                    shards_gained: 0,
                    numbered_shard: Option::None,
                    position_changed: false,
                    entity_defeated: false,
                    door_opened: false,
                    game_won: false,
                };
            }

            let shard_info = self.get_shard_at_position(collect_action.position);
            if shard_info.is_none() {
                return ActionResult {
                    result_id: get_block_timestamp().into(),
                    action_type: ActionType::CollectShard,
                    success: false,
                    error_code: Errors::SHARD_NOT_FOUND,
                    damage_dealt: 0,
                    damage_taken: 0,
                    shards_gained: 0,
                    numbered_shard: Option::None,
                    position_changed: false,
                    entity_defeated: false,
                    door_opened: false,
                    game_won: false,
                };
            }

            self.remove_shard_from_location(ref world, collect_action.position);
            
            let mut game_won = false;
            let mut shards_gained = 0;
            let numbered_shard_collected = shard_info;
            
            match shard_info {
                Option::Some(numbered_shard) => {
                    game_won = player.collect_numbered_shard(numbered_shard);
                    shards_gained = 1;
                    
                    let mut game_session: GameSession = world.read_model(player.current_session_id);
                    game_session.collect_numbered_shard();
                    world.write_model(@game_session);

                    world.emit_event(
                        @NumberedShardCollected {
                            player_id: player.player_id,
                            shard_type: numbered_shard,
                            position: collect_action.position,
                            turn_number: player.turn_number,
                        },
                    );
                },
                Option::None => {
                    player.collect_shard();
                    shards_gained = 1;
                    
                    let mut game_session: GameSession = world.read_model(player.current_session_id);
                    game_session.collect_shard();
                    world.write_model(@game_session);
                },
            }

            ActionResult {
                result_id: get_block_timestamp().into(),
                action_type: ActionType::CollectShard,
                success: true,
                error_code: 0,
                damage_dealt: 0,
                damage_taken: 0,
                shards_gained,
                numbered_shard: numbered_shard_collected,
                position_changed: false,
                entity_defeated: false,
                door_opened: false,
                game_won,
            }
        }

        fn execute_open_door_action(
            self: @ContractState,
            ref world: WorldStorage,
            ref player: Player,
            door_action: OpenDoorAction,
        ) -> ActionResult {
            if !player.can_use_doors() {
                return ActionResult {
                    result_id: get_block_timestamp().into(),
                    action_type: ActionType::OpenDoor,
                    success: false,
                    error_code: Errors::MOVEMENT_LOCKED,
                    damage_dealt: 0,
                    damage_taken: 0,
                    shards_gained: 0,
                    numbered_shard: Option::None,
                    position_changed: false,
                    entity_defeated: false,
                    door_opened: false,
                    game_won: false,
                };
            }

            let mut door: Door = world.read_model(door_action.door_id);

            if !(player.position.x == door.position.x
                && player.position.y == door.position.y
                && player.position.location_id == door.room_id) {
                return ActionResult {
                    result_id: get_block_timestamp().into(),
                    action_type: ActionType::OpenDoor,
                    success: false,
                    error_code: Errors::DOOR_NOT_ACCESSIBLE,
                    damage_dealt: 0,
                    damage_taken: 0,
                    shards_gained: 0,
                    numbered_shard: Option::None,
                    position_changed: false,
                    entity_defeated: false,
                    door_opened: false,
                    game_won: false,
                };
            }

            if door.requires_cleared {
                let room: Room = world.read_model(door.room_id);
                if !room.is_cleared() {
                    return ActionResult {
                        result_id: get_block_timestamp().into(),
                        action_type: ActionType::OpenDoor,
                        success: false,
                        error_code: Errors::ROOM_NOT_CLEARED,
                        damage_dealt: 0,
                        damage_taken: 0,
                        shards_gained: 0,
                        numbered_shard: Option::None,
                        position_changed: false,
                        entity_defeated: false,
                        door_opened: false,
                        game_won: false,
                    };
                }
            }

            door.open();
            world.write_model(@door);

            let new_room_id = door.connected_room_id;
            self.initialize_room_if_needed(ref world, new_room_id);

            let new_position = Position { x: 1, y: 1, location_id: new_room_id };
            player.change_location(new_position);
            player.enter_through_door(door_action.door_id);

            self.spawn_door_enemy(ref world, new_position, door_action.door_id);

            let mut game_session: GameSession = world.read_model(player.current_session_id);
            game_session.open_door();
            world.write_model(@game_session);

            let mut player_stats: PlayerStats = world.read_model(player.player_id);
            player_stats.record_door_opened();
            world.write_model(@player_stats);

            ActionResult {
                result_id: get_block_timestamp().into(),
                action_type: ActionType::OpenDoor,
                success: true,
                error_code: 0,
                damage_dealt: 0,
                damage_taken: 0,
                shards_gained: 0,
                numbered_shard: Option::None,
                position_changed: true,
                entity_defeated: false,
                door_opened: true,
                game_won: false,
            }
        }

        fn validate_actions_internal(
            self: @ContractState, world: @WorldStorage, player: Player, actions: Span<Action>,
        ) -> Array<ActionValidation> {
            let mut validations = ArrayTrait::new();
            let config: GameConfig = world.read_model('default');

            let mut temp_player = player;

            let mut i = 0;
            loop {
                if i >= actions.len() {
                    break;
                }

                let action = *actions.at(i);
                let validation = self.validate_single_action(world, temp_player, action, i);

                if validation.is_valid {
                    temp_player = self.simulate_action_effect(temp_player, action);
                }

                validations.append(validation);
                i += 1;
            };

            validations
        }

        fn validate_single_action(
            self: @ContractState, world: @WorldStorage, player: Player, action: Action, index: u32,
        ) -> ActionValidation {
            let validation_id = self.generate_validation_id(player.player_id, index);

            match action {
                Action::Move(move_action) => {
                    let is_valid_delta = move_action.x_delta >= -1 && move_action.x_delta <= 1 &&
                                        move_action.y_delta >= -1 && move_action.y_delta <= 1;
                    
                    let new_position = player.position.move_by_delta(move_action.x_delta, move_action.y_delta);
                    let is_valid_position = self.is_valid_position_in_room(new_position);
                    let is_valid = is_valid_delta && is_valid_position;

                    let error_reason = if !is_valid_delta {
                        Errors::INVALID_DELTA
                    } else if !is_valid_position {
                        Errors::INVALID_MOVEMENT
                    } else {
                        0
                    };

                    ActionValidation {
                        validation_id,
                        player_id: player.player_id,
                        action_index: index,
                        action_type: ActionType::Move,
                        is_valid,
                        error_reason,
                        required_shards: 0,
                        required_health: 0,
                        required_position: new_position,
                    }
                },
                Action::Attack(attack_action) => {
                    let entity: Entity = world.read_model(attack_action.entity_id);
                    let is_alive = entity.is_alive;
                    let same_position = entity.is_at_same_position(player.position);
                    let is_valid = is_alive && same_position;

                    let error_reason = if !is_alive {
                        Errors::ENTITY_NOT_FOUND
                    } else if !same_position {
                        Errors::ENTITY_NOT_AT_POSITION
                    } else {
                        0
                    };

                    ActionValidation {
                        validation_id,
                        player_id: player.player_id,
                        action_index: index,
                        action_type: ActionType::Attack,
                        is_valid,
                        error_reason,
                        required_shards: 0,
                        required_health: 0,
                        required_position: player.position,
                    }
                },
                Action::CollectShard(collect_action) => {
                    let same_location = player.position.is_same_location(collect_action.position);
                    let has_shard = self.get_shard_at_position(collect_action.position).is_some();
                    let is_valid = same_location && has_shard;

                    ActionValidation {
                        validation_id,
                        player_id: player.player_id,
                        action_index: index,
                        action_type: ActionType::CollectShard,
                        is_valid,
                        error_reason: if is_valid {
                            0
                        } else {
                            Errors::SHARD_NOT_FOUND
                        },
                        required_shards: 0,
                        required_health: 0,
                        required_position: collect_action.position,
                    }
                },
                Action::OpenDoor(door_action) => {
                    let door: Door = world.read_model(door_action.door_id);
                    let at_door = player.position.x == door.position.x
                        && player.position.y == door.position.y
                        && player.position.location_id == door.room_id;

                    let can_use_doors = player.can_use_doors();
                    let mut is_valid = at_door && can_use_doors;
                    let mut error_reason = 0;

                    if !can_use_doors {
                        error_reason = Errors::MOVEMENT_LOCKED;
                        is_valid = false;
                    } else if !at_door {
                        error_reason = Errors::DOOR_NOT_ACCESSIBLE;
                        is_valid = false;
                    } else if door.requires_cleared {
                        let room: Room = world.read_model(door.room_id);
                        if !room.is_cleared() {
                            error_reason = Errors::ROOM_NOT_CLEARED;
                            is_valid = false;
                        }
                    }

                    ActionValidation {
                        validation_id,
                        player_id: player.player_id,
                        action_index: index,
                        action_type: ActionType::OpenDoor,
                        is_valid,
                        error_reason,
                        required_shards: 0,
                        required_health: 0,
                        required_position: door.position,
                    }
                },
            }
        }

        fn simulate_action_effect(
            self: @ContractState, mut player: Player, action: Action,
        ) -> Player {
            match action {
                Action::Move(move_action) => {
                    let new_position = player.position.move_by_delta(move_action.x_delta, move_action.y_delta);
                    player.change_location(new_position);
                },
                Action::Attack(_) => {
                    // No state change simulation needed for attack
                },
                Action::CollectShard(_) => { 
                    player.collect_shard(); 
                },
                Action::OpenDoor(door_action) => { 
                    let new_position = PositionTrait::new_room(1, 1, door_action.door_id + 1);
                    player.change_location(new_position);
                    player.enter_through_door(door_action.door_id);
                },
            }
            player
        }

        fn ensure_all_actions_valid(self: @ContractState, validations: Span<ActionValidation>) {
            let mut i = 0;
            loop {
                if i >= validations.len() {
                    break;
                }
                let validation = *validations.at(i);
                assert(validation.is_valid, validation.error_reason);
                i += 1;
            };
        }

        fn handle_victory(self: @ContractState, ref world: WorldStorage, ref player: Player) {
            let mut game_session: GameSession = world.read_model(player.current_session_id);
            let end_time = get_block_timestamp();
            
            game_session.complete_with_victory(end_time);
            player.end_game();
            
            world.write_model(@game_session);
            world.write_model(@player);

            world.emit_event(
                @VictoryAchieved {
                    player_id: player.player_id,
                    session_id: player.current_session_id,
                    completion_time: game_session.get_duration(),
                    total_turns: game_session.total_turns,
                },
            );
        }

        fn process_end_of_turn_effects(
            self: @ContractState, ref world: WorldStorage, ref player: Player,
        ) {
            if player.dodge_active_turns == 0 {
                self.process_proximity_damage(ref world, player.player_id);
            }

            if !player.is_alive {
                world
                    .emit_event(
                        @PlayerDeath {
                            player_id: player.player_id,
                            position: player.position,
                            cause: 'proximity_damage',
                            turn_number: player.turn_number,
                        },
                    );
            }
        }

        fn process_proximity_damage(
            self: @ContractState, ref world: WorldStorage, player_id: ContractAddress,
        ) {
            let mut player: Player = world.read_model(player_id);

            if player.dodge_active_turns > 0 {
                return;
            }

            let nearby_entities = self.get_entities_in_room(player.position.location_id);
            let mut total_damage = 0;

            let mut i = 0;
            loop {
                if i >= nearby_entities.len() {
                    break;
                }
                let entity = *nearby_entities.at(i);
                if entity.is_alive && entity.position.is_adjacent(player.position) {
                    total_damage += entity.damage_per_turn;
                }
                i += 1;
            };

            if total_damage > 0 {
                let survived = player.take_damage(total_damage);
                world.write_model(@player);

                let mut game_session: GameSession = world.read_model(player.current_session_id);
                game_session.take_damage(total_damage);
                world.write_model(@game_session);
            }
        }

        fn generate_session_id(self: @ContractState, player_id: ContractAddress) -> felt252 {
            let timestamp = get_block_timestamp();
            let block_number = get_block_number();
            let player_felt: felt252 = player_id.into();
            timestamp.into() + block_number.into() + player_felt
        }

        fn generate_turn_id(
            self: @ContractState, player_id: ContractAddress, turn_number: u32,
        ) -> felt252 {
            let timestamp = get_block_timestamp();
            let player_felt: felt252 = player_id.into();
            let turn_felt: felt252 = turn_number.into();
            timestamp.into() + player_felt + turn_felt + 'turn'
        }

        fn generate_validation_id(
            self: @ContractState, player_id: ContractAddress, action_index: u32,
        ) -> felt252 {
            let timestamp = get_block_timestamp();
            let player_felt: felt252 = player_id.into();
            let index_felt: felt252 = action_index.into();
            timestamp.into() + player_felt + index_felt + 'validation'
        }

        fn is_valid_position_in_room(self: @ContractState, position: Position) -> bool {
            let world = self.world_default();
            let config: GameConfig = world.read_model('default');

            if position.x >= config.grid_size || position.y >= config.grid_size {
                return false;
            }

            let room: Room = world.read_model(position.location_id);
            position.x >= room.boundaries.min_x
                && position.x <= room.boundaries.max_x
                && position.y >= room.boundaries.min_y
                && position.y <= room.boundaries.max_y
        }

        fn initialize_room(self: @ContractState, ref world: WorldStorage, room_id: u32) {
            let boundaries = GridBounds { min_x: 0, max_x: 8, min_y: 0, max_y: 8 };
            let mut room = RoomTrait::new(room_id, boundaries);

            let config: GameConfig = world.read_model('default');
            room.initialize(config);

            world.write_model(@room);

            self.spawn_entities_in_room(ref world, room_id);
            self.create_room_doors(ref world, room_id);
        }

        fn initialize_room_if_needed(self: @ContractState, ref world: WorldStorage, room_id: u32) {
            let room: Room = world.read_model(room_id);
            if !room.initialized {
                self.initialize_room(ref world, room_id);
            }
        }

        fn spawn_entities_in_room(self: @ContractState, ref world: WorldStorage, room_id: u32) {
            let config: GameConfig = world.read_model('default');
            let entity_count = config.get_entities_per_room();

            let mut i = 0;
            loop {
                if i >= entity_count {
                    break;
                }

                let entity_id = self.generate_entity_id(room_id, i);
                let entity_type = self.determine_entity_type(i);
                let spawn_position = PositionTrait::new_room(3 + i, 3, room_id);
                
                let entity = EntityTrait::new_with_shard_drop(entity_id, entity_type, spawn_position, Option::None, false);
                world.write_model(@entity);

                let entity_state = EntityState {
                    entity_id,
                    alert_level: AlertLevel::Idle,
                    detection_range: 3,
                    last_seen_player_pos: PositionTrait::new_room(0, 0, 0),
                    patrol_path_index: 0,
                    last_action_block: get_block_number(),
                };
                world.write_model(@entity_state);

                i += 1;
            };
        }

        fn spawn_door_enemy(
            self: @ContractState, ref world: WorldStorage, position: Position, door_id: u32,
        ) {
            let entity_id = self.generate_entity_id(door_id, 999); 
            
            let block_num = get_block_number();
            let entity_type = if block_num % 2 == 0 { 
                EntityType::Male 
            } else { 
                EntityType::Female 
            };
            
            let entity = EntityTrait::new_with_shard_drop(entity_id, entity_type, position, Option::None, true);
            world.write_model(@entity);

            let entity_state = EntityState {
                entity_id,
                alert_level: AlertLevel::Combat,
                detection_range: 1,
                last_seen_player_pos: position,
                patrol_path_index: 0,
                last_action_block: get_block_number(),
            };
            world.write_model(@entity_state);
        }

        fn create_room_doors(self: @ContractState, ref world: WorldStorage, room_id: u32) {
            let door_positions = array![
                PositionTrait::new_room(4, 0, room_id), 
                PositionTrait::new_room(8, 4, room_id), 
                PositionTrait::new_room(4, 8, room_id), 
                PositionTrait::new_room(0, 4, room_id)  
            ];

            let connected_rooms = array![
                room_id + 10, 
                room_id + 1,  
                if room_id > 10 { room_id - 10 } else { room_id }, 
                if room_id > 1 { room_id - 1 } else { room_id }    
            ];

            let mut door_count = 0;
            let mut i = 0;
            loop {
                if i >= door_positions.len() {
                    break;
                }

                let door_id = room_id * 10 + i;
                let position = *door_positions.at(i);
                let connected_room_id = *connected_rooms.at(i);

                let door = DoorTrait::new(door_id, position, room_id, connected_room_id);
                world.write_model(@door);

                door_count += 1;
                i += 1;
            };

            let mut room: Room = world.read_model(room_id);
            room.door_count = door_count;
            world.write_model(@room);
        }

        fn handle_entity_death(
            self: @ContractState,
            ref world: WorldStorage,
            entity_id: felt252,
            drop_position: Position,
        ) {
            let config: GameConfig = world.read_model('default');

            if self.should_drop_shard(config.shard_drop_rate) {
                self.create_shard_at_position(ref world, drop_position);
            }
        }

        fn get_entities_in_room(self: @ContractState, room_id: u32) -> Array<Entity> {
            ArrayTrait::new()
        }

        fn get_shard_at_position(self: @ContractState, position: Position) -> Option<NumberedShard> {
            Option::Some(NumberedShard::One) 
        }

        fn remove_shard_from_location(
            self: @ContractState, ref world: WorldStorage, position: Position,
        ) {
            // Implementation for removing shard from location
        }

        fn create_shard_at_position(
            self: @ContractState, ref world: WorldStorage, position: Position,
        ) {
            // Implementation for creating shard at position
        }

        fn determine_entity_type(self: @ContractState, index: u32) -> EntityType {
            match index % 2 {
                0 => EntityType::Male,
                1 => EntityType::Female,
                _ => EntityType::Male,
            }
        }

        fn generate_entity_id(self: @ContractState, room_id: u32, index: u32) -> felt252 {
            let room_felt: felt252 = room_id.into();
            let index_felt: felt252 = index.into();
            'entity' + room_felt + index_felt
        }

        fn should_drop_shard(self: @ContractState, drop_rate_percentage: u32) -> bool {
            let block_num = get_block_number();
            let random_value = block_num % 100;
            random_value < drop_rate_percentage.into()
        }

        fn get_random_numbered_shard(self: @ContractState) -> NumberedShard {
            let block_num = get_block_number();
            let timestamp = get_block_timestamp();
            let random_value = (block_num + timestamp) % 3;
            
            if random_value == 0 {
                NumberedShard::One
            } else if random_value == 1 {
                NumberedShard::Two
            } else {
                NumberedShard::Three
            }
        }

        fn should_drop_numbered_shard(self: @ContractState, drop_rate_percentage: u32) -> bool {
            let block_num = get_block_number();
            let random_value = block_num % 100;
            random_value < drop_rate_percentage.into()
        }

        fn is_door_spawned_entity(self: @ContractState, entity_id: felt252) -> bool {
            let world = self.world_default();
            let entity: Entity = world.read_model(entity_id);
            entity.spawned_from_door
        }
    }
}