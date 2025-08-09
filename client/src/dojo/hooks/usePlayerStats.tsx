import { useState, useCallback, useEffect } from "react";
import { useAccount } from "@starknet-react/core";
import { addAddressPadding } from "starknet";
import { PlayerStats } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UsePlayerStatsReturn {
  playerStats: PlayerStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (playerId?: string) => Promise<void>;
}

export const usePlayerStats = (playerId?: string): UsePlayerStatsReturn => {
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useAccount();

  const refetch = useCallback(async (playerId?: string) => {
    const targetPlayerId = playerId || (account ? addAddressPadding(account.address).toLowerCase() : null);
    
    if (!targetPlayerId) {
      setPlayerStats(null);
      return;
    }

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
            query GetPlayerStats($playerId: String!) {
              playerStats(where: { player_id: $playerId }) {
                edges {
                  node {
                    player_id
                    games_played
                    games_won
                    total_shards_collected
                    total_entities_defeated
                    total_playtime
                    best_completion_time
                    highest_room_reached
                    total_damage_dealt
                    total_damage_taken
                    doors_opened
                    total_turns_played
                    total_actions_taken
                    numbered_shards_collected
                  }
                }
              }
            }
          `,
          variables: {
            playerId: targetPlayerId,
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

      const statsData = result.data?.playerStats?.edges?.[0]?.node;
      setPlayerStats(statsData);
      console.log("✅ Player stats fetched:", statsData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch player stats");
      console.error("❌ Error fetching player stats:", error);
      setError(error);
      setPlayerStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  useEffect(() => {
    refetch(playerId);
  }, [playerId, refetch]);

  return {
    playerStats,
    isLoading,
    error,
    refetch,
  };
}; 