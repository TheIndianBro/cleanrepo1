import { useState, useCallback, useEffect } from "react";
import { GameConfig } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseGameConfigReturn {
  gameConfig: GameConfig | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (configId?: string) => Promise<void>;
}

export const useGameConfig = (configId: string = "default"): UseGameConfigReturn => {
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (configId: string = "default") => {
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
            query GetGameConfig($configId: String!) {
              gameConfigs(where: { config_id: $configId }) {
                edges {
                  node {
                    config_id
                    grid_size
                    starting_health
                    starting_shards
                    base_damage
                    max_actions_per_turn
                    door_count
                    entity_spawn_rate
                    shard_drop_rate
                    rooms_for_victory
                    dodge_cooldown
                  }
                }
              }
            }
          `,
          variables: {
            configId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const configData = result.data?.gameConfigs?.edges?.[0]?.node;
      setGameConfig(configData);
      console.log("✅ Game config fetched:", configData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch game config");
      console.error("❌ Error fetching game config:", error);
      setError(error);
      setGameConfig(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(configId);
  }, [configId, refetch]);

  return {
    gameConfig,
    isLoading,
    error,
    refetch,
  };
}; 