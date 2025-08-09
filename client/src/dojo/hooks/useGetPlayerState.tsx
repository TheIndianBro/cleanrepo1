import { useState, useCallback, useEffect } from "react";
import { Player } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseGetPlayerStateReturn {
  playerState: Player | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useGetPlayerState = (): UseGetPlayerStateReturn => {
  const [playerState, setPlayerState] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${dojoConfig.toriiUrl}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query GetPlayerState {
              getPlayerState {
                player_id
                position {
                  x
                  y
                  location_id
                }
                health
                max_health
                shards
                game_active
                is_alive
                current_session_id
                rooms_cleared
                turn_number
                dodge_active_turns
                has_shard_one
                has_shard_two
                has_shard_three
                entered_door_id
                door_enemy_alive
                movement_locked
                special_ability_cooldown
                has_key
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const playerData = result.data?.getPlayerState;
      setPlayerState(playerData);
      console.log("✅ Player state fetched:", playerData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch player state");
      console.error("❌ Error fetching player state:", error);
      setError(error);
      setPlayerState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    playerState,
    isLoading,
    error,
    refetch,
  };
}; 