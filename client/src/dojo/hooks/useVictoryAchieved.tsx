import { useState, useCallback, useEffect } from "react";
import { VictoryAchieved } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseVictoryAchievedReturn {
  victoryAchieved: VictoryAchieved | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (eventId?: string) => Promise<void>;
}

export const useVictoryAchieved = (eventId: string = "default"): UseVictoryAchievedReturn => {
  const [victoryAchieved, setVictoryAchieved] = useState<VictoryAchieved | null>(null);
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
            query GetVictoryAchieved($eventId: String!) {
              victoryAchievedEvents(where: { event_id: $eventId }) {
                edges {
                  node {
                    player_id
                    session_id
                    completion_time
                    total_turns
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

      const victoryAchievedData = result.data?.victoryAchievedEvents?.edges?.[0]?.node;
      setVictoryAchieved(victoryAchievedData);
      console.log("✅ Victory achieved event fetched:", victoryAchievedData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch victory achieved event");
      console.error("❌ Error fetching victory achieved event:", error);
      setError(error);
      setVictoryAchieved(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(eventId);
  }, [eventId, refetch]);

  return {
    victoryAchieved,
    isLoading,
    error,
    refetch,
  };
}; 