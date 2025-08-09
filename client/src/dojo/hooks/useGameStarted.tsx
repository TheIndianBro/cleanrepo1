import { useState, useCallback, useEffect } from "react";
import { GameStarted } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseGameStartedReturn {
  gameStarted: GameStarted | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (eventId?: string) => Promise<void>;
}

export const useGameStarted = (eventId: string = "default"): UseGameStartedReturn => {
  const [gameStarted, setGameStarted] = useState<GameStarted | null>(null);
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
            query GetGameStarted($eventId: String!) {
              gameStartedEvents(where: { event_id: $eventId }) {
                edges {
                  node {
                    player_id
                    session_id
                    start_time
                    starting_room_id
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

      const gameStartedData = result.data?.gameStartedEvents?.edges?.[0]?.node;
      setGameStarted(gameStartedData);
      console.log("✅ Game started event fetched:", gameStartedData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch game started event");
      console.error("❌ Error fetching game started event:", error);
      setError(error);
      setGameStarted(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(eventId);
  }, [eventId, refetch]);

  return {
    gameStarted,
    isLoading,
    error,
    refetch,
  };
}; 