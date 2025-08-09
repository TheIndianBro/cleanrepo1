use starknet::ContractAddress;



#[derive(Copy, Drop, Serde, Introspect)]
pub enum EntityType {
    Male,        
    Female,      
}

#[derive(Copy, Drop, Serde, Introspect)]
pub enum AlertLevel {
    Idle,
    Alerted,    
    Combat,
}

#[derive(Copy, Drop, Serde, Introspect, PartialEq)]
pub enum GameResult {
    InProgress,
    Victory,
    Defeat,
}

#[derive(Copy, Drop, Serde, Introspect, PartialEq)]
pub enum NumberedShard {
    One,
    Two, 
    Three,
}



#[derive(Copy, Drop, Serde, Introspect, PartialEq)]
pub enum ActionType {
    Move,
    OpenDoor,
    Attack,
    CollectShard,
}

#[derive(Copy, Drop, Serde)] 
pub struct MoveAction { 
    pub x_delta: i32,  
    pub y_delta: i32,  
}

#[derive(Copy, Drop, Serde)] 
pub struct OpenDoorAction { 
    pub door_id: u32,
}

#[derive(Copy, Drop, Serde)] 
pub struct AttackAction { 
    pub entity_id: felt252,
}

#[derive(Copy, Drop, Serde)]
pub struct CollectShardAction {
    pub action_id: felt252,
    pub position: Position,
}

#[derive(Copy, Drop, Serde)]
pub enum Action {
    Move: MoveAction,
    OpenDoor: OpenDoorAction,
    Attack: AttackAction,
    CollectShard: CollectShardAction,
}

#[derive(Copy, Drop, Serde)]
pub struct ActionResult {
    pub result_id: felt252,
    pub action_type: ActionType,
    pub success: bool,
    pub error_code: felt252,
    pub damage_dealt: u32,
    pub damage_taken: u32,
    pub shards_gained: u32,
    pub numbered_shard: Option<NumberedShard>,
    pub position_changed: bool,
    pub entity_defeated: bool,
    pub door_opened: bool,
    pub game_won: bool,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct TurnExecution {
    #[key]
    pub turn_id: felt252,
    pub player_id: ContractAddress,
    pub session_id: felt252,
    pub actions_count: u32,
    pub successful_actions: u32,
    pub total_damage_dealt: u32,
    pub total_damage_taken: u32,
    pub total_shards_gained: u32,
    pub numbered_shards_collected: u32,
    pub timestamp: u64,
    pub turn_number: u32,
}



#[derive(Copy, Drop, Serde,Introspect)]
pub struct Position {
    pub x: u32,
    pub y: u32,
    pub location_id: u32,
}

#[derive(Copy, Drop, Serde,Introspect)]
pub struct GridBounds {
    pub min_x: u32,
    pub max_x: u32,
    pub min_y: u32,
    pub max_y: u32,
}

#[generate_trait]
pub impl PositionImpl of PositionTrait {
    fn new(x: u32, y: u32, location_id: u32) -> Position {
        Position { x, y, location_id }
    }

    fn new_room(x: u32, y: u32, room_id: u32) -> Position {
        Position { x, y, location_id: room_id }
    }

    fn distance_to(self: Position, other: Position) -> u32 {
        let dx = if self.x > other.x { self.x - other.x } else { other.x - self.x };
        let dy = if self.y > other.y { self.y - other.y } else { other.y - self.y };
        dx + dy
    }

    fn is_adjacent(self: Position, other: Position) -> bool {
        if self.location_id != other.location_id {
            return false;
        }
        let dx = if self.x > other.x { self.x - other.x } else { other.x - self.x };
        let dy = if self.y > other.y { self.y - other.y } else { other.y - self.y };
        (dx == 1 && dy == 0) || (dx == 0 && dy == 1)
    }

    fn is_same_position(self: Position, other: Position) -> bool {
        self.x == other.x && self.y == other.y && self.location_id == other.location_id
    }

    fn is_same_location(self: Position, other: Position) -> bool {
        self.location_id == other.location_id
    }

    fn move_by_delta(self: Position, x_delta: i32, y_delta: i32) -> Position {
        let new_x = if x_delta < 0 {
            if self.x > 0 { self.x - 1 } else { self.x }
        } else if x_delta > 0 {
            self.x + 1
        } else {
            self.x
        };

        let new_y = if y_delta < 0 {
            if self.y > 0 { self.y - 1 } else { self.y }
        } else if y_delta > 0 {
            self.y + 1
        } else {
            self.y
        };

        Position { 
            x: new_x, 
            y: new_y, 
            location_id: self.location_id,
        }
    }

    fn is_valid_on_grid(self: Position, grid_size: u32) -> bool {
        self.x < grid_size && self.y < grid_size
    }
}



#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct GameConfig {
    #[key]
    pub config_id: felt252,
    pub grid_size: u32,
    pub starting_health: u32,
    pub starting_shards: u32,
    pub base_damage: u32,          
    pub max_actions_per_turn: u32,
    pub door_count: u32,         
    pub entity_spawn_rate: u32,
    pub shard_drop_rate: u32,
    pub rooms_for_victory: u32,
    pub dodge_cooldown: u32,
}

#[generate_trait]
pub impl GameConfigImpl of GameConfigTrait {
    fn default_config() -> GameConfig {
        GameConfig {
            config_id: 'default',
            grid_size: 10,
            starting_health: 100,
            starting_shards: 5,
            base_damage: 25,          
            max_actions_per_turn: 4,     
            door_count: 20,          
            entity_spawn_rate: 70,
            shard_drop_rate: 80,
            rooms_for_victory: 10,
            dodge_cooldown: 3,
        }
    }

    fn get_base_damage(self: GameConfig) -> u32 {
        self.base_damage
    }

    fn get_entities_per_room(self: GameConfig) -> u32 {
        2  
    }
}



#[derive(Copy, Drop, Serde, Introspect)]
#[dojo::model]
pub struct Player {
    #[key]
    pub player_id: ContractAddress,
    pub position: Position,
    pub health: u32,
    pub max_health: u32,
    pub shards: u32,
    pub game_active: bool,
    pub is_alive: bool,
    pub current_session_id: felt252,
    pub rooms_cleared: u32,
    pub turn_number: u32,
    pub dodge_active_turns: u32, 
    pub has_shard_one: bool,
    pub has_shard_two: bool,
    pub has_shard_three: bool, 
    pub entered_door_id: Option<u32>,      
    pub door_enemy_alive: bool,    
    pub movement_locked: bool,
    
    pub special_ability_cooldown: u32,
    pub has_key: bool,
}

#[generate_trait]
pub impl PlayerImpl of PlayerTrait {
    fn new(player_id: ContractAddress, session_id: felt252, config: GameConfig) -> Player {
        Player {
            player_id,
            position: PositionTrait::new_room(1, 1, 1),
            health: config.starting_health,
            max_health: config.starting_health,
            shards: config.starting_shards,
            game_active: true,
            is_alive: true,
            current_session_id: session_id,
            rooms_cleared: 0,
            turn_number: 0,
            dodge_active_turns: 0,
            has_shard_one: false,
            has_shard_two: false,
            has_shard_three: false,
            entered_door_id: Option::None,
            door_enemy_alive: false,
            movement_locked: false,
            special_ability_cooldown: 0,
            has_key: false,
        }
    }

    fn take_damage(ref self: Player, damage: u32) -> bool {
        if damage >= self.health {
            self.health = 0;
            self.is_alive = false;
            false
        } else {
            self.health -= damage;
            true
        }
    }

    fn collect_numbered_shard(ref self: Player, shard: NumberedShard) -> bool {
        match shard {
            NumberedShard::One => { self.has_shard_one = true; },
            NumberedShard::Two => { self.has_shard_two = true; },
            NumberedShard::Three => { self.has_shard_three = true; },
        }

        
        if self.has_shard_one && self.has_shard_two && self.has_shard_three {
            self.game_active = false; 
            true
        } else {
            false
        }
    }

    fn collect_shard(ref self: Player) {
        self.shards += 1;
    }

    fn spend_shards(ref self: Player, amount: u32) -> bool {
        if self.shards >= amount {
            self.shards -= amount;
            true
        } else {
            false
        }
    }

    fn change_location(ref self: Player, new_position: Position) {
        self.position = new_position;
    }

    fn clear_room(ref self: Player) {
        self.rooms_cleared += 1;
    }

    fn respawn(ref self: Player, spawn_position: Position) {
        self.position = spawn_position;
        self.health = self.max_health;
        self.is_alive = true;
        self.shards = self.shards / 2;
        
        self.entered_door_id = Option::None;
        self.door_enemy_alive = false;
        self.movement_locked = false;
    }

    fn start_turn(ref self: Player) {
        self.turn_number += 1;
        if self.dodge_active_turns > 0 {
            self.dodge_active_turns -= 1;
        }
        if self.special_ability_cooldown > 0 {
            self.special_ability_cooldown -= 1;
        }
    }

    fn end_game(ref self: Player) {
        self.game_active = false;
    }

    fn heal(ref self: Player, amount: u32) {
        let new_health = self.health + amount;
        if new_health > self.max_health {
            self.health = self.max_health;
        } else {
            self.health = new_health;
        }
    }

    fn activate_dodge(ref self: Player, dodge_duration: u32) {
        self.dodge_active_turns = dodge_duration;
    }

    fn enter_through_door(ref self: Player, door_id: u32) {
        self.entered_door_id = Option::Some(door_id);
        self.door_enemy_alive = true;
        self.movement_locked = true;
    }

    fn defeat_door_enemy(ref self: Player) {
        self.door_enemy_alive = false;
        self.movement_locked = false;
    }

    fn can_use_doors(self: Player) -> bool {
        !self.movement_locked
    }

    fn can_exit_door(self: Player, door_id: u32) -> bool {
        if self.movement_locked {
            return false;
        }
        
        match self.entered_door_id {
            Option::Some(entered_id) => entered_id == door_id,
            Option::None => true,
        }
    }

    fn has_victory_condition(self: Player) -> bool {
        self.has_shard_one && self.has_shard_two && self.has_shard_three
    }
}



#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct PlayerStats {
    #[key]
    pub player_id: ContractAddress,
    pub games_played: u32,
    pub games_won: u32,
    pub total_shards_collected: u32,
    pub total_entities_defeated: u32,
    pub total_playtime: u64,
    pub best_completion_time: u64,
    pub highest_room_reached: u32,
    pub total_damage_dealt: u32,
    pub total_damage_taken: u32,
    pub doors_opened: u32,
    pub total_turns_played: u32,
    pub total_actions_taken: u32,
    pub numbered_shards_collected: u32,
}

#[generate_trait]
pub impl PlayerStatsImpl of PlayerStatsTrait {
    fn new(player_id: ContractAddress) -> PlayerStats {
        PlayerStats {
            player_id,
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
        }
    }

    fn start_game(ref self: PlayerStats) {
        self.games_played += 1;
    }

    fn complete_game(ref self: PlayerStats, completion_time: u64, rooms_reached: u32) {
        self.games_won += 1;
        if self.best_completion_time == 0 || completion_time < self.best_completion_time {
            self.best_completion_time = completion_time;
        }
        if rooms_reached > self.highest_room_reached {
            self.highest_room_reached = rooms_reached;
        }
    }

    fn add_playtime(ref self: PlayerStats, duration: u64) {
        self.total_playtime += duration;
    }

    fn record_entity_defeat(ref self: PlayerStats) {
        self.total_entities_defeated += 1;
    }

    fn add_shards_collected(ref self: PlayerStats, amount: u32) {
        self.total_shards_collected += amount;
    }

    fn add_numbered_shard(ref self: PlayerStats) {
        self.numbered_shards_collected += 1;
    }

    fn record_damage_dealt(ref self: PlayerStats, damage: u32) {
        self.total_damage_dealt += damage;
    }

    fn record_damage_taken(ref self: PlayerStats, damage: u32) {
        self.total_damage_taken += damage;
    }

    fn record_turn_played(ref self: PlayerStats, actions_taken: u32) {
        self.total_turns_played += 1;
        self.total_actions_taken += actions_taken;
    }

    fn record_door_opened(ref self: PlayerStats) {
        self.doors_opened += 1;
    }
}



#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct Room {
    #[key]
    pub room_id: u32, 
    pub initialized: bool,
    pub cleared: bool,
    pub entity_count: u32,
    pub active_entities: u32,
    pub has_treasure: bool,
    pub treasure_collected: bool,
    pub door_count: u32,
    pub boundaries: GridBounds,
}

#[generate_trait]
pub impl RoomImpl of RoomTrait {
    fn new(room_id: u32, boundaries: GridBounds) -> Room {
        Room {
            room_id,
            initialized: false,
            cleared: false,
            entity_count: 0,
            active_entities: 0,
            has_treasure: false,
            treasure_collected: false,
            door_count: 0,
            boundaries,
        }
    }

    fn initialize(ref self: Room, config: GameConfig) {
        self.initialized = true;
        self.entity_count = config.get_entities_per_room();
        self.active_entities = self.entity_count;
        self.door_count = config.door_count;
    }

    fn defeat_entity(ref self: Room) {
        if self.active_entities > 0 {
            self.active_entities -= 1;
        }
        
        if self.active_entities == 0 {
            self.cleared = true;
        }
    }

    fn is_cleared(self: Room) -> bool {
        self.cleared
    }

    fn collect_treasure(ref self: Room) {
        if self.has_treasure && !self.treasure_collected {
            self.treasure_collected = true;
        }
    }
}



#[derive(Copy, Drop, Serde, Introspect)]
#[dojo::model]
pub struct Door {
    #[key]
    pub door_id: u32,
    pub position: Position,
    pub room_id: u32,
    pub connected_room_id: u32,
    pub is_open: bool,
    pub requires_key: bool,
    pub requires_cleared: bool,
}

#[generate_trait]
pub impl DoorImpl of DoorTrait {
    fn new(door_id: u32, position: Position, room_id: u32, connected_room_id: u32) -> Door {
        Door {
            door_id,
            position,
            room_id,
            connected_room_id,
            is_open: false,
            requires_key: false,
            requires_cleared: false,
        }
    }

    fn open(ref self: Door) {
        self.is_open = true;
    }

    fn close(ref self: Door) {
        self.is_open = false;
    }

    fn can_traverse(self: Door) -> bool {
        self.is_open
    }
}



#[derive(Copy, Drop, Serde, Introspect)]
#[dojo::model]
pub struct Entity {
    #[key]
    pub entity_id: felt252,
    pub entity_type: EntityType,
    pub position: Position,
    pub health: u32,
    pub max_health: u32,
    pub is_alive: bool,
    pub damage_per_turn: u32,
    pub drops_numbered_shard: Option<NumberedShard>,
    pub spawned_from_door: bool,
}

#[derive(Copy, Drop, Serde, Introspect)]
#[dojo::model]
pub struct EntityState {
    #[key]
    pub entity_id: felt252,
    pub alert_level: AlertLevel,
    pub detection_range: u32,
    pub last_seen_player_pos: Position,
    pub patrol_path_index: u32,
    pub last_action_block: u64,
}

#[generate_trait]
pub impl EntityImpl of EntityTrait {
    fn new(entity_id: felt252, entity_type: EntityType, position: Position) -> Entity {
        let (health, damage) = match entity_type {
            EntityType::Male => (50, 20),
            EntityType::Female => (40, 15),
        };

        Entity {
            entity_id,
            entity_type,
            position,
            health,
            max_health: health,
            is_alive: true,
            damage_per_turn: damage,
            drops_numbered_shard: Option::None,
            spawned_from_door: false,
        }
    }

    fn new_with_shard_drop(entity_id: felt252, entity_type: EntityType, position: Position, shard_drop: Option<NumberedShard>, is_door_spawned: bool) -> Entity {
        let (health, damage) = match entity_type {
            EntityType::Male => (50, 20),
            EntityType::Female => (40, 15),
        };

        Entity {
            entity_id,
            entity_type,
            position,
            health,
            max_health: health,
            is_alive: true,
            damage_per_turn: damage,
            drops_numbered_shard: shard_drop,
            spawned_from_door: is_door_spawned,
        }
    }

    fn take_damage(ref self: Entity, damage: u32) -> bool {
        if damage >= self.health {
            self.health = 0;
            self.is_alive = false;
            false
        } else {
            self.health -= damage;
            true
        }
    }

    fn move_to_position(ref self: Entity, new_position: Position) {
        self.position = new_position;
    }

    fn can_detect_player(self: Entity, player_position: Position, detection_range: u32) -> bool {
        self.position.distance_to(player_position) <= detection_range
    }

    fn is_at_same_position(self: Entity, player_position: Position) -> bool {
        self.position.is_same_position(player_position)
    }

    fn get_dropped_shard(self: Entity) -> Option<NumberedShard> {
        if !self.is_alive {
            self.drops_numbered_shard
        } else {
            Option::None
        }
    }
}



#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct GameSession {
    #[key]
    pub session_id: felt252,
    pub player_id: ContractAddress,
    pub start_time: u64,
    pub end_time: u64,
    pub rooms_cleared: u32,
    pub total_shards_collected: u32,
    pub numbered_shards_collected: u32,
    pub entities_defeated: u32,
    pub total_damage_dealt: u32,
    pub total_damage_taken: u32,
    pub doors_opened: u32,
    pub deaths: u32,
    pub session_complete: bool,
    pub total_turns: u32,
    pub total_actions: u32,
    pub victory_achieved: bool,
}

#[generate_trait]
pub impl GameSessionImpl of GameSessionTrait {
    fn new(session_id: felt252, player_id: ContractAddress, start_time: u64) -> GameSession {
        GameSession {
            session_id,
            player_id,
            start_time,
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
        }
    }

    fn clear_room(ref self: GameSession) {
        self.rooms_cleared += 1;
    }

    fn collect_shard(ref self: GameSession) {
        self.total_shards_collected += 1;
    }

    fn collect_numbered_shard(ref self: GameSession) {
        self.numbered_shards_collected += 1;
        self.total_shards_collected += 1;
    }

    fn defeat_entity(ref self: GameSession) {
        self.entities_defeated += 1;
    }

    fn deal_damage(ref self: GameSession, damage: u32) {
        self.total_damage_dealt += damage;
    }

    fn take_damage(ref self: GameSession, damage: u32) {
        self.total_damage_taken += damage;
    }

    fn open_door(ref self: GameSession) {
        self.doors_opened += 1;
    }

    fn record_death(ref self: GameSession) {
        self.deaths += 1;
    }

    fn complete_with_victory(ref self: GameSession, end_time: u64) {
        self.end_time = end_time;
        self.session_complete = true;
        self.victory_achieved = true;
    }

    fn end_session(ref self: GameSession, end_time: u64) {
        self.end_time = end_time;
        self.session_complete = true;
    }

    fn get_duration(self: GameSession) -> u64 {
        if self.end_time > 0 {
            self.end_time - self.start_time
        } else {
            0
        }
    }

    fn record_turn(ref self: GameSession, actions_count: u32) {
        self.total_turns += 1;
        self.total_actions += actions_count;
    }

    fn is_victory(self: GameSession, rooms_for_victory: u32) -> bool {
        self.victory_achieved || self.rooms_cleared >= rooms_for_victory
    }
}



#[derive(Copy, Drop, Serde, Introspect)]
pub struct ActionValidation {
    pub validation_id: felt252,
    pub player_id: ContractAddress,
    pub action_index: u32,
    pub action_type: ActionType,
    pub is_valid: bool,
    pub error_reason: felt252,
    pub required_shards: u32,
    pub required_health: u32,
    pub required_position: Position,
}



#[derive(Copy, Drop, Serde, Introspect)]
#[dojo::model]
pub struct ShardLocation {
    #[key]
    pub location_id: felt252,
    pub position: Position,
    pub numbered_shard: Option<NumberedShard>,
    pub collected: bool,
}

#[derive(Copy, Drop, Serde, Introspect)]
#[dojo::model]
pub struct Doorway {
    #[key]
    pub doorway_id: u32,
    pub position: Position,
    pub room_id: u32,
    pub connected_room_id: u32, 
    pub is_open: bool,
    pub requires_cleared: bool,
}

#[generate_trait]
pub impl DoorwayImpl of DoorwayTrait {
    fn new(doorway_id: u32, position: Position, room_id: u32, connected_room_id: u32,) -> Doorway {
        Doorway {
            doorway_id,
            position,
            room_id,
            connected_room_id, 
            is_open: true,
            requires_cleared: false,
        }
    }
}



#[derive(Copy, Drop, Serde)] 
pub struct TransitionAction { 
    pub action_id: felt252,
    pub doorway_id: u32,
}