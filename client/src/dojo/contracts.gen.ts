import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish, CairoOption, CairoCustomEnum, ByteArray } from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {

	const build_actions_attackEntity_calldata = (entityId: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "attack_entity",
			calldata: [entityId],
		};
	};

	const actions_attackEntity = async (snAccount: Account | AccountInterface, entityId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_attackEntity_calldata(entityId),
				"blockrooms",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_collectShard_calldata = (position: models.Position): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "collect_shard",
			calldata: [position],
		};
	};

	const actions_collectShard = async (snAccount: Account | AccountInterface, position: models.Position) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_collectShard_calldata(position),
				"blockrooms",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_endGame_calldata = (): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "end_game",
			calldata: [],
		};
	};

	const actions_endGame = async (snAccount: Account | AccountInterface) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_endGame_calldata(),
				"blockrooms",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_executeTurn_calldata = (actions: Array<Action>): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "execute_turn",
			calldata: [actions],
		};
	};

	const actions_executeTurn = async (snAccount: Account | AccountInterface, actions: Array<Action>) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_executeTurn_calldata(actions),
				"blockrooms",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_getAvailableDoorways_calldata = (locationId: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "get_available_doorways",
			calldata: [locationId],
		};
	};

	const actions_getAvailableDoorways = async (locationId: BigNumberish) => {
		try {
			return await provider.call("blockrooms", build_actions_getAvailableDoorways_calldata(locationId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_getEntitiesInLocation_calldata = (locationId: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "get_entities_in_location",
			calldata: [locationId],
		};
	};

	const actions_getEntitiesInLocation = async (locationId: BigNumberish) => {
		try {
			return await provider.call("blockrooms", build_actions_getEntitiesInLocation_calldata(locationId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_getGameStatus_calldata = (): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "get_game_status",
			calldata: [],
		};
	};

	const actions_getGameStatus = async () => {
		try {
			return await provider.call("blockrooms", build_actions_getGameStatus_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_getPlayerState_calldata = (): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "get_player_state",
			calldata: [],
		};
	};

	const actions_getPlayerState = async () => {
		try {
			return await provider.call("blockrooms", build_actions_getPlayerState_calldata());
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_getRoomState_calldata = (roomId: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "get_room_state",
			calldata: [roomId],
		};
	};

	const actions_getRoomState = async (roomId: BigNumberish) => {
		try {
			return await provider.call("blockrooms", build_actions_getRoomState_calldata(roomId));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_getTurnHistory_calldata = (limit: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "get_turn_history",
			calldata: [limit],
		};
	};

	const actions_getTurnHistory = async (limit: BigNumberish) => {
		try {
			return await provider.call("blockrooms", build_actions_getTurnHistory_calldata(limit));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_initializePlayer_calldata = (): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "initialize_player",
			calldata: [],
		};
	};

	const actions_initializePlayer = async (snAccount: Account | AccountInterface) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_initializePlayer_calldata(),
				"blockrooms",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_movePlayer_calldata = (xDelta: BigNumberish, yDelta: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "move_player",
			calldata: [xDelta, yDelta],
		};
	};

	const actions_movePlayer = async (snAccount: Account | AccountInterface, xDelta: BigNumberish, yDelta: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_movePlayer_calldata(xDelta, yDelta),
				"blockrooms",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_openDoor_calldata = (doorId: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "open_door",
			calldata: [doorId],
		};
	};

	const actions_openDoor = async (snAccount: Account | AccountInterface, doorId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_openDoor_calldata(doorId),
				"blockrooms",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_respawnPlayer_calldata = (): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "respawn_player",
			calldata: [],
		};
	};

	const actions_respawnPlayer = async (snAccount: Account | AccountInterface) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_respawnPlayer_calldata(),
				"blockrooms",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_startGame_calldata = (): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "start_game",
			calldata: [],
		};
	};

	const actions_startGame = async (snAccount: Account | AccountInterface) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_startGame_calldata(),
				"blockrooms",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_validateActions_calldata = (actions: Array<Action>): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "validate_actions",
			calldata: [actions],
		};
	};

	const actions_validateActions = async (actions: Array<Action>) => {
		try {
			return await provider.call("blockrooms", build_actions_validateActions_calldata(actions));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};



	return {
		actions: {
			attackEntity: actions_attackEntity,
			buildAttackEntityCalldata: build_actions_attackEntity_calldata,
			collectShard: actions_collectShard,
			buildCollectShardCalldata: build_actions_collectShard_calldata,
			endGame: actions_endGame,
			buildEndGameCalldata: build_actions_endGame_calldata,
			executeTurn: actions_executeTurn,
			buildExecuteTurnCalldata: build_actions_executeTurn_calldata,
			getAvailableDoorways: actions_getAvailableDoorways,
			buildGetAvailableDoorwaysCalldata: build_actions_getAvailableDoorways_calldata,
			getEntitiesInLocation: actions_getEntitiesInLocation,
			buildGetEntitiesInLocationCalldata: build_actions_getEntitiesInLocation_calldata,
			getGameStatus: actions_getGameStatus,
			buildGetGameStatusCalldata: build_actions_getGameStatus_calldata,
			getPlayerState: actions_getPlayerState,
			buildGetPlayerStateCalldata: build_actions_getPlayerState_calldata,
			getRoomState: actions_getRoomState,
			buildGetRoomStateCalldata: build_actions_getRoomState_calldata,
			getTurnHistory: actions_getTurnHistory,
			buildGetTurnHistoryCalldata: build_actions_getTurnHistory_calldata,
			initializePlayer: actions_initializePlayer,
			buildInitializePlayerCalldata: build_actions_initializePlayer_calldata,
			movePlayer: actions_movePlayer,
			buildMovePlayerCalldata: build_actions_movePlayer_calldata,
			openDoor: actions_openDoor,
			buildOpenDoorCalldata: build_actions_openDoor_calldata,
			respawnPlayer: actions_respawnPlayer,
			buildRespawnPlayerCalldata: build_actions_respawnPlayer_calldata,
			startGame: actions_startGame,
			buildStartGameCalldata: build_actions_startGame_calldata,
			validateActions: actions_validateActions,
			buildValidateActionsCalldata: build_actions_validateActions_calldata,
		},
	};
}