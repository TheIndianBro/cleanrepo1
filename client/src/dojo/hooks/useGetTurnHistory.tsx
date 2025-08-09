import { useState, useCallback, useEffect } from "react";
import { BigNumberish } from "starknet";
import { TurnExecution } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseGetTurnHistoryReturn {
  turnHistory: TurnExecution[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (limit: BigNumberish) => Promise<void>;
}

export const useGetTurnHistory = (limit?: BigNumberish): UseGetTurnHistoryReturn => {
  const [turnHistory, setTurnHistory] = useState<TurnExecution[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (limit: BigNumberish) => {
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
            query GetTurnHistory($limit: BigNumberish!) {
              getTurnHistory(limit: $limit) {
                turn_id
                player_id
                session_id
                actions_count
                successful_actions
                total_damage_dealt
                total_damage_taken
                total_shards_gained
                numbered_shards_collected
                timestamp
                turn_number
              }
            }
          `,
          variables: {
            limit: limit.toString(),
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

      const historyData = result.data?.getTurnHistory || [];
      setTurnHistory(historyData);
      console.log("✅ Turn history fetched:", historyData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch turn history");
      console.error("❌ Error fetching turn history:", error);
      setError(error);
      setTurnHistory(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (limit) {
      refetch(limit);
    }
  }, [limit, refetch]);

  return {
    turnHistory,
    isLoading,
    error,
    refetch,
  };
}; 