import { useState, useCallback, useEffect } from "react";
import { TurnExecution } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseTurnExecutionReturn {
  turnExecution: TurnExecution | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (turnId?: string) => Promise<void>;
}

export const useTurnExecution = (turnId: string = "default"): UseTurnExecutionReturn => {
  const [turnExecution, setTurnExecution] = useState<TurnExecution | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (turnId: string = "default") => {
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
            query GetTurnExecution($turnId: String!) {
              turnExecutions(where: { turn_id: $turnId }) {
                edges {
                  node {
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
              }
            }
          `,
          variables: {
            turnId,
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

      const turnExecutionData = result.data?.turnExecutions?.edges?.[0]?.node;
      setTurnExecution(turnExecutionData);
      console.log("✅ Turn execution fetched:", turnExecutionData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch turn execution");
      console.error("❌ Error fetching turn execution:", error);
      setError(error);
      setTurnExecution(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(turnId);
  }, [turnId, refetch]);

  return {
    turnExecution,
    isLoading,
    error,
    refetch,
  };
}; 