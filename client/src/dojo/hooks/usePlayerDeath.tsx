import { useState, useCallback, useEffect } from "react";
import { PlayerDeath } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UsePlayerDeathReturn {
  playerDeath: PlayerDeath | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (eventId?: string) => Promise<void>;
}

export const usePlayerDeath = (eventId: string = "default"): UsePlayerDeathReturn => {
  const [playerDeath, setPlayerDeath] = useState<PlayerDeath | null>(null);
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
            query GetPlayerDeath($eventId: String!) {
              playerDeathEvents(where: { event_id: $eventId }) {
                edges {
                  node {
                    player_id
                    position {
                      x
                      y
                      location_id
                    }
                    cause
                    turn_number
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

      const playerDeathData = result.data?.playerDeathEvents?.edges?.[0]?.node;
      setPlayerDeath(playerDeathData);
      console.log("✅ Player death event fetched:", playerDeathData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch player death event");
      console.error("❌ Error fetching player death event:", error);
      setError(error);
      setPlayerDeath(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(eventId);
  }, [eventId, refetch]);

  return {
    playerDeath,
    isLoading,
    error,
    refetch,
  };
}; 