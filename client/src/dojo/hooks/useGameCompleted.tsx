import { useState, useCallback, useEffect } from "react";
import { GameCompleted } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseGameCompletedReturn {
  gameCompleted: GameCompleted | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (eventId?: string) => Promise<void>;
}

export const useGameCompleted = (eventId: string = "default"): UseGameCompletedReturn => {
  const [gameCompleted, setGameCompleted] = useState<GameCompleted | null>(null);
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
            query GetGameCompleted($eventId: String!) {
              gameCompletedEvents(where: { event_id: $eventId }) {
                edges {
                  node {
                    player_id
                    session_id
                    rooms_cleared
                    result
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

      const gameCompletedData = result.data?.gameCompletedEvents?.edges?.[0]?.node;
      setGameCompleted(gameCompletedData);
      console.log("✅ Game completed event fetched:", gameCompletedData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch game completed event");
      console.error("❌ Error fetching game completed event:", error);
      setError(error);
      setGameCompleted(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(eventId);
  }, [eventId, refetch]);

  return {
    gameCompleted,
    isLoading,
    error,
    refetch,
  };
}; 