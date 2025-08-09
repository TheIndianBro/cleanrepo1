import { useState, useCallback, useEffect } from "react";
import { TurnExecuted } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseTurnExecutedReturn {
  turnExecuted: TurnExecuted | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (eventId?: string) => Promise<void>;
}

export const useTurnExecuted = (eventId: string = "default"): UseTurnExecutedReturn => {
  const [turnExecuted, setTurnExecuted] = useState<TurnExecuted | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (eventId: string = "default") => {
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
            query GetTurnExecuted($eventId: String!) {
              turnExecutedEvents(where: { event_id: $eventId }) {
                edges {
                  node {
                    player_id
                    turn_id
                    turn_number
                    actions_attempted
                    actions_successful
                    total_damage_dealt
                    total_damage_taken
                    shards_gained
                    numbered_shards_gained
                    position_end {
                      x
                      y
                      location_id
                    }
                  }
                }
              }
            }
          `,
          variables: {
            eventId,
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

      const turnExecutedData = result.data?.turnExecutedEvents?.edges?.[0]?.node;
      setTurnExecuted(turnExecutedData);
      console.log("✅ Turn executed event fetched:", turnExecutedData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch turn executed event");
      console.error("❌ Error fetching turn executed event:", error);
      setError(error);
      setTurnExecuted(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(eventId);
  }, [eventId, refetch]);

  return {
    turnExecuted,
    isLoading,
    error,
    refetch,
  };
}; 