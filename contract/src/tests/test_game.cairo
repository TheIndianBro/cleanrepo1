#[cfg(test)]
mod tests {
    // Starknet imports
    use starknet::{ContractAddress, get_block_timestamp};
    use starknet::testing::{
        set_account_contract_address, set_block_timestamp, set_contract_address,
    };

    // Models imports
    use blockrooms::models::{
        Action, ActionResult, ActionType, ActionValidation, AlertLevel, AttackAction, 
        CollectShardAction, Door, DoorTrait, Doorway, DoorwayTrait, Entity, EntityState, 
        EntityTrait, EntityType, GameConfig, GameConfigTrait, GameResult, GameSession,
        GameSessionTrait, GridBounds, MoveAction, NumberedShard, OpenDoorAction, Player, 
        PlayerStats, PlayerStatsTrait, PlayerTrait, Position, PositionTrait, Room, RoomTrait, 
        TransitionAction, TurnExecution,m_PlayerStats,m_Player,m_GameSession,m_GameConfig,m_Room,m_Entity,m_EntityState,m_Door,m_Doorway,m_TurnExecution,
    };

    // System imports
    use blockrooms::systems::actions::{
        IBlockRoomsDispatcher, IBlockRoomsDispatcherTrait, actions
    };
    use dojo::model::ModelStorage;
    use dojo::world::{WorldStorage, WorldStorageTrait};

    // Dojo imports
    use dojo_cairo_test::WorldStorageTestTrait;
    use dojo_cairo_test::{
        ContractDef, ContractDefTrait, NamespaceDef, TestResource, spawn_test_world,
    };

    // ------- Constants -------
    fn PLAYER() -> ContractAddress {
        starknet::contract_address_const::<'PLAYER'>()
    }

    fn PLAYER_2() -> ContractAddress {
        starknet::contract_address_const::<'PLAYER_2'>()
    }

    fn namespace_def() -> NamespaceDef {
        let ndef = NamespaceDef {
            namespace: "blockrooms",
            resources: [
                // Models
                TestResource::Model(m_Player::TEST_CLASS_HASH),
                TestResource::Model(m_PlayerStats::TEST_CLASS_HASH),
                TestResource::Model(m_GameSession::TEST_CLASS_HASH),
                TestResource::Model(m_GameConfig::TEST_CLASS_HASH),
                TestResource::Model(m_Room::TEST_CLASS_HASH),
                TestResource::Model(m_Entity::TEST_CLASS_HASH),
                TestResource::Model(m_EntityState::TEST_CLASS_HASH),
                TestResource::Model(m_Door::TEST_CLASS_HASH),
                TestResource::Model(m_Doorway::TEST_CLASS_HASH),
                TestResource::Model(m_TurnExecution::TEST_CLASS_HASH),
                // Contract
                TestResource::Contract(actions::TEST_CLASS_HASH),
                // Events
                TestResource::Event(actions::e_TurnExecuted::TEST_CLASS_HASH),
                TestResource::Event(actions::e_ActionExecuted::TEST_CLASS_HASH),
                TestResource::Event(actions::e_GameStarted::TEST_CLASS_HASH),
                TestResource::Event(actions::e_RoomCleared::TEST_CLASS_HASH),
                TestResource::Event(actions::e_PlayerDeath::TEST_CLASS_HASH),
                TestResource::Event(actions::e_GameCompleted::TEST_CLASS_HASH),
                TestResource::Event(actions::e_VictoryAchieved::TEST_CLASS_HASH),
                TestResource::Event(actions::e_NumberedShardCollected::TEST_CLASS_HASH),
            ]
                .span(),
        };
        ndef
    }

    fn contract_defs() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@"blockrooms", @"actions")
                .with_writer_of([dojo::utils::bytearray_hash(@"blockrooms")].span()),
        ]
            .span()
    }

    fn create_game_system(world: WorldStorage) -> IBlockRoomsDispatcher {
        let (contract_address, _) = world.dns(@"actions").unwrap();
        let game_system = IBlockRoomsDispatcher { contract_address };
        game_system
    }

    fn create_test_world() -> WorldStorage {
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());
        world
    }

    // ------- Helper Functions -------
    fn cheat_caller_address(address: ContractAddress) {
        set_contract_address(address);
        set_account_contract_address(address);
    }

    fn cheat_block_timestamp(timestamp: u64) {
        set_block_timestamp(timestamp);
    }

    fn setup_player_and_game(
        world: WorldStorage, game_system: IBlockRoomsDispatcher, player: ContractAddress,
    ) {
        cheat_caller_address(player);
        game_system.initialize_player();
        game_system.start_game();
    }

    // ------- Test Cases -------

    #[test]
    #[available_gas(40000000)]
    fn test_initialize_player() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        cheat_caller_address(PLAYER());
        game_system.initialize_player();

        let player_stats: PlayerStats = world.read_model(PLAYER());
        let config: GameConfig = world.read_model('default');

        assert(player_stats.player_id == PLAYER(), 'player id match');
        assert(player_stats.games_played == 0, 'games played 0');
        assert(player_stats.total_shards_collected == 0, 'shards 0');
        assert(player_stats.total_entities_defeated == 0, 'entities 0');
        assert(player_stats.total_playtime == 0, 'playtime 0');
        assert(player_stats.numbered_shards_collected == 0, 'numbered shards 0');

        assert(config.grid_size > 0, 'grid size set');
        assert(config.starting_health > 0, 'start hp set');
        assert(config.base_damage > 0, 'base damage set');
        assert(config.max_actions_per_turn > 0, 'max actions set');
    }

    #[test]
    #[available_gas(40000000)]
    fn test_initialize_player_twice() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        cheat_caller_address(PLAYER());
        game_system.initialize_player();

        let stats_before: PlayerStats = world.read_model(PLAYER());

        // Try to initialize again - should not reset values
        game_system.initialize_player();

        let stats_after: PlayerStats = world.read_model(PLAYER());

        assert(stats_before.player_id == stats_after.player_id, 'stats same');
        assert(stats_before.games_played == stats_after.games_played, 'games same');
    }

    #[test]
    #[available_gas(160000000)]
    fn test_start_game() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        cheat_caller_address(PLAYER());
        cheat_block_timestamp(1000);

        game_system.initialize_player();
        game_system.start_game();

        let player: Player = world.read_model(PLAYER());
        let config: GameConfig = world.read_model('default');

        assert(player.game_active, 'game active');
        assert(player.is_alive, 'player alive');
        assert(player.position.location_id == 1, 'in room 1');
        assert(player.position.x == 1 && player.position.y == 1, 'at position 1,1');
        assert(player.health == config.starting_health, 'full health');
        assert(player.shards == config.starting_shards, 'starting shards');
        assert(player.turn_number == 0, 'turn 0');
        assert(!player.has_shard_one, 'no shard one');
        assert(!player.has_shard_two, 'no shard two');
        assert(!player.has_shard_three, 'no shard three');
        assert(player.dodge_active_turns == 0, 'no dodge active');
        assert(!player.movement_locked, 'movement not locked');
        assert(!player.door_enemy_alive, 'no door enemy');
        assert(player.entered_door_id.is_none(), 'no door entered');
    }

    #[test]
    #[available_gas(100000000)]
    fn test_start_game_twice() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        cheat_caller_address(PLAYER());
        game_system.initialize_player();
        game_system.start_game();

        let state_before: Player = world.read_model(PLAYER());

        // Try to start game again - should not reset
        game_system.start_game();

        let state_after: Player = world.read_model(PLAYER());

        assert(state_before.health == state_after.health, 'health same');
        assert(state_before.shards == state_after.shards, 'shards same');
        assert(state_before.current_session_id == state_after.current_session_id, 'session same');
    }

    #[test]
    #[available_gas(160000000)]
    fn test_move_player() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        setup_player_and_game(world, game_system, PLAYER());

        let player_before: Player = world.read_model(PLAYER());
        
        game_system.move_player(0, 1); // Move north

        let player_after: Player = world.read_model(PLAYER());

        assert(player_after.position.y == player_before.position.y + 1, 'moved north');
        assert(player_after.turn_number == player_before.turn_number + 1, 'turn inc');
    }

    #[test]
    #[available_gas(120000000)]
    fn test_execute_turn_multiple_actions() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        setup_player_and_game(world, game_system, PLAYER());

        let player_before: Player = world.read_model(PLAYER());
        
        let actions = array![
            Action::Move(MoveAction { x_delta: 0, y_delta: 1 }), // North
            Action::Move(MoveAction { x_delta: 1, y_delta: 0 }), // East
        ];

        game_system.execute_turn(actions);

        let player_after: Player = world.read_model(PLAYER());

        assert(player_after.position.x == player_before.position.x + 1, 'moved east');
        assert(player_after.position.y == player_before.position.y + 1, 'moved north');
        assert(player_after.turn_number == player_before.turn_number + 1, 'turn inc');
    }

    #[test]
    #[available_gas(100000000)]
    fn test_validate_actions() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        setup_player_and_game(world, game_system, PLAYER());

        let actions = array![
            Action::Move(MoveAction { x_delta: 0, y_delta: 1 }), // North
            Action::Move(MoveAction { x_delta: 1, y_delta: 0 }), // East
        ];

        let validations = game_system.validate_actions(actions);

        assert(validations.len() == 2, 'two validations');
        
        let first_validation = *validations.at(0);
        let second_validation = *validations.at(1);

        assert(first_validation.is_valid, 'first valid');
        assert(first_validation.action_type == ActionType::Move, 'first move');
        assert(second_validation.is_valid, 'second valid');
        assert(second_validation.action_type == ActionType::Move, 'second move');
    }

    #[test]
    #[available_gas(160000000)]
    fn test_collect_shard() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        setup_player_and_game(world, game_system, PLAYER());

        let player_before: Player = world.read_model(PLAYER());
        let shard_position = player_before.position;

        game_system.collect_shard(shard_position);

        let player_after: Player = world.read_model(PLAYER());

        assert(player_after.turn_number == player_before.turn_number + 1, 'turn inc');
    }

    #[test]
    #[available_gas(80000000)]
    fn test_respawn_player() {
        let mut world = create_test_world();
        let game_system = create_game_system(world);

        setup_player_and_game(world, game_system, PLAYER());

        // Kill player first by setting them as dead
        let mut player: Player = world.read_model(PLAYER());
        let original_shards = player.shards;
        
        player.is_alive = false;
        player.health = 0;
        player.movement_locked = true;
        player.entered_door_id = Option::Some(5);
        player.door_enemy_alive = true;
        world.write_model(@player);

        game_system.respawn_player();

        let player_after: Player = world.read_model(PLAYER());
        let config: GameConfig = world.read_model('default');

        assert(player_after.is_alive, 'player alive');
        assert(player_after.health == config.starting_health, 'full health');
        assert(player_after.position.location_id == 1, 'back to start');
        assert(player_after.shards == original_shards / 2, 'half shards');
        assert(!player_after.movement_locked, 'movement unlocked');
        assert(player_after.entered_door_id.is_none(), 'no door restriction');
        assert(!player_after.door_enemy_alive, 'no door enemy');
    }

    #[test]
    #[available_gas(160000000)]
    fn test_end_game() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        cheat_caller_address(PLAYER());
        cheat_block_timestamp(1000);

        setup_player_and_game(world, game_system, PLAYER());

        cheat_block_timestamp(2000);

        game_system.end_game();

        let player: Player = world.read_model(PLAYER());
        let player_stats: PlayerStats = world.read_model(PLAYER());
        let game_session: GameSession = world.read_model(player.current_session_id);

        assert(!player.game_active, 'game not active');
        assert(game_session.session_complete, 'session complete');
        assert(game_session.end_time == 2000, 'end time set');
    }

    #[test]
    #[available_gas(160000000)]
    fn test_get_game_status() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        cheat_caller_address(PLAYER());
        game_system.initialize_player();

        let status_before = game_system.get_game_status();
        assert(status_before == GameResult::Defeat, 'defeat status');

        game_system.start_game();

        let status_active = game_system.get_game_status();
        assert(status_active == GameResult::InProgress, 'in progress');
    }

    #[test]
    #[available_gas(100000000)]
    fn test_get_player_state() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        setup_player_and_game(world, game_system, PLAYER());

        let player_state = game_system.get_player_state();

        assert(player_state.player_id == PLAYER(), 'player id ok');
        assert(player_state.game_active, 'game active');
        assert(player_state.position.location_id == 1, 'in room 1');
        assert(player_state.is_alive, 'player alive');
        assert(player_state.special_ability_cooldown == 0, 'no cooldown');
        assert(!player_state.has_key, 'no key');
    }

    #[test]
    #[available_gas(100000000)]
    fn test_get_room_state() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        setup_player_and_game(world, game_system, PLAYER());

        let room_state = game_system.get_room_state(1);

        assert(room_state.room_id == 1, 'room id 1');
        assert(room_state.initialized, 'room initialized');
        assert(!room_state.cleared, 'room not cleared');
        assert(room_state.active_entities > 0, 'has entities');
    }

    #[test]
    #[available_gas(120000000)]
    fn test_multiple_players() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        // Initialize first player
        cheat_caller_address(PLAYER());
        game_system.initialize_player();
        game_system.start_game();

        // Initialize second player
        cheat_caller_address(PLAYER_2());
        game_system.initialize_player();
        game_system.start_game();

        let player1: Player = world.read_model(PLAYER());
        let player2: Player = world.read_model(PLAYER_2());
        let player1_stats: PlayerStats = world.read_model(PLAYER());
        let player2_stats: PlayerStats = world.read_model(PLAYER_2());

        assert(player1.game_active, 'p1 active');
        assert(player2.game_active, 'p2 active');
        assert(player1.player_id != player2.player_id, 'diff players');
        assert(player1.current_session_id != player2.current_session_id, 'diff sessions');
        assert(player1_stats.player_id == PLAYER(), 'p1 stats ok');
        assert(player2_stats.player_id == PLAYER_2(), 'p2 stats ok');
    }

    #[test]
    #[available_gas(200000000)]
    fn test_complete_game_flow() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        setup_player_and_game(world, game_system, PLAYER());

        let player_before: Player = world.read_model(PLAYER());

        // Test movement actions
        let movement_actions = array![
            Action::Move(MoveAction { x_delta: 0, y_delta: 1 }), // North
            Action::Move(MoveAction { x_delta: 1, y_delta: 0 }), // East
            Action::Move(MoveAction { x_delta: 0, y_delta: -1 }), // South
        ];

        game_system.execute_turn(movement_actions);

        let player_after: Player = world.read_model(PLAYER());

        assert(player_after.turn_number == player_before.turn_number + 1, 'turn incremented');
        assert(player_after.position.x == player_before.position.x + 1, 'moved east');
        assert(player_after.position.y == player_before.position.y, 'back to original y');
    }

    #[test] 
    #[available_gas(120000000)]
    fn test_invalid_movement() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        setup_player_and_game(world, game_system, PLAYER());

        // Test invalid delta (too large)
        let invalid_actions = array![
            Action::Move(MoveAction { x_delta: 2, y_delta: 0 }), // Invalid: too large
        ];

        let validations = game_system.validate_actions(invalid_actions);
        let validation = *validations.at(0);

        assert(!validation.is_valid, 'move invalid');
        assert(validation.error_reason != 0, 'has error');
    }

    #[test]
    #[available_gas(160000000)]
    fn test_attack_entity() {
        let mut world = create_test_world();
        let game_system = create_game_system(world);

        setup_player_and_game(world, game_system, PLAYER());

        // Create a test entity at the same position as player
        let player: Player = world.read_model(PLAYER());
        let entity_id = 'test_entity';
        
        let entity = EntityTrait::new(entity_id, EntityType::Male, player.position);
        world.write_model(@entity);

        let entity_state = EntityState {
            entity_id,
            alert_level: AlertLevel::Combat,
            detection_range: 3,
            last_seen_player_pos: player.position,
            patrol_path_index: 0,
            last_action_block: 0,
        };
        world.write_model(@entity_state);

        game_system.attack_entity(entity_id);

        let player_after: Player = world.read_model(PLAYER());
        let entity_after: Entity = world.read_model(entity_id);

        assert(player_after.turn_number == player.turn_number + 1, 'turn incremented');
        assert(entity_after.health < entity.health, 'entity took damage');
    }

    #[test]
    #[available_gas(80000000)]
    fn test_numbered_shard_collection() {
        let mut world = create_test_world();
        let game_system = create_game_system(world);

        setup_player_and_game(world, game_system, PLAYER());

        let mut player: Player = world.read_model(PLAYER());
        
        // Test collecting numbered shards
        let victory1 = player.collect_numbered_shard(NumberedShard::One);
        assert(player.has_shard_one, 'has shard one');
        assert(!victory1, 'no victory yet');

        let victory2 = player.collect_numbered_shard(NumberedShard::Two);
        assert(player.has_shard_two, 'has shard two');
        assert(!victory2, 'no victory yet');

        let victory3 = player.collect_numbered_shard(NumberedShard::Three);
        assert(player.has_shard_three, 'has shard three');
        assert(victory3, 'victory achieved');
        assert(!player.game_active, 'game ended');
    }

    #[test]
    #[available_gas(80000000)]
    fn test_door_mechanics() {
        let mut world = create_test_world();
        let game_system = create_game_system(world);

        setup_player_and_game(world, game_system, PLAYER());

        let player_before: Player = world.read_model(PLAYER());

        // Create a door at player's position
        let door_id = 1_u32;
        let door = DoorTrait::new(door_id, player_before.position, 1, 2);
        world.write_model(@door);

        game_system.open_door(door_id);

        let player_after: Player = world.read_model(PLAYER());
        let door_after: Door = world.read_model(door_id);

        assert(player_after.turn_number == player_before.turn_number + 1, 'turn incremented');
        assert(door_after.is_open, 'door opened');
        assert(player_after.position.location_id == 2, 'moved to new room');
        assert(player_after.movement_locked, 'movement locked');
        assert(player_after.door_enemy_alive, 'door enemy spawned');
        assert(player_after.entered_door_id == Option::Some(door_id), 'door id recorded');
    }

    #[test]
    #[available_gas(100000000)]
    fn test_dodge_mechanics() {
        let mut world = create_test_world();
        let game_system = create_game_system(world);

        setup_player_and_game(world, game_system, PLAYER());

        let mut player: Player = world.read_model(PLAYER());
        let config: GameConfig = world.read_model('default');
        
        // Test dodge activation
        player.activate_dodge(config.dodge_cooldown);
        assert(player.dodge_active_turns == config.dodge_cooldown, 'dodge activated');

        // Test dodge countdown
        player.start_turn();
        assert(player.dodge_active_turns == config.dodge_cooldown - 1, 'dodge decreased');

    }

    #[test]
    #[available_gas(100000000)]
    fn test_player_take_damage() {
        let world = create_test_world();
        let game_system = create_game_system(world);

        setup_player_and_game(world, game_system, PLAYER());

        let mut player: Player = world.read_model(PLAYER());
        let initial_health = player.health;
        
        // Test taking damage but surviving
        let survived = player.take_damage(20);
        assert(survived, 'player survived');
        assert(player.health == initial_health - 20, 'health decreased');
        assert(player.is_alive, 'still alive');

        // Test taking fatal damage
        let fatal_damage = player.health + 10;
        let survived_fatal = player.take_damage(fatal_damage);
        assert(!survived_fatal, 'player died');
        assert(player.health == 0, 'health zero');
        assert(!player.is_alive, 'not alive');
    }

    #[test]
    #[available_gas(80000000)]
    fn test_room_clearing() {
        let mut world = create_test_world();
        let game_system = create_game_system(world);

        setup_player_and_game(world, game_system, PLAYER());

        let mut room: Room = world.read_model(1_u32);
        let initial_entities = room.active_entities;
        
        // Test defeating entities
        room.defeat_entity();
        assert(room.active_entities == initial_entities - 1, 'entity defeated');
        assert(!room.is_cleared(), 'room not cleared yet');

        // Clear all entities
        let mut i = room.active_entities;
        loop {
            if i == 0 {
                break;
            }
            room.defeat_entity();
            i -= 1;
        };

        assert(room.is_cleared(), 'room cleared');
        assert(room.active_entities == 0, 'no active entities');
    }

    #[test]
    #[available_gas(80000000)]
    fn test_position_utility_functions() {
        let pos1 = PositionTrait::new(3, 4, 1);
        let pos2 = PositionTrait::new(5, 6, 1);
        let pos3 = PositionTrait::new(3, 5, 1); // Adjacent to pos1
        let pos4 = PositionTrait::new(3, 4, 2); // Same x,y but different location

        // Test distance calculation
        let distance = pos1.distance_to(pos2);
        assert(distance == 4, 'distance correct'); // |5-3| + |6-4| = 4

        // Test adjacency
        assert(pos1.is_adjacent(pos3), 'positions adjacent');
        assert(!pos1.is_adjacent(pos2), 'positions not adjacent');
        assert(!pos1.is_adjacent(pos4), 'diff locations not adjacent');

        // Test same position
        assert(pos1.is_same_position(pos1), 'same position');
        assert(!pos1.is_same_position(pos4), 'diff locations');

        // Test same location
        assert(pos1.is_same_location(pos2), 'same location');
        assert(!pos1.is_same_location(pos4), 'diff locations');

        // Test movement
        let moved_pos = pos1.move_by_delta(1, -1);
        assert(moved_pos.x == 4 && moved_pos.y == 3, 'moved correctly');
    }
}