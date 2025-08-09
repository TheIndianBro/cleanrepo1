import { useState, useCallback, useEffect } from "react";
import { GameSession } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseGameSessionReturn {
  gameSession: GameSession | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (sessionId?: string) => Promise<void>;
}

export const useGameSession = (sessionId?: string): UseGameSessionReturn => {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (sessionId?: string) => {
    if (!sessionId) {
      setGameSession(null);
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
            query GetGameSession($sessionId: String!) {
              gameSessions(where: { session_id: $sessionId }) {
                edges {
                  node {
                    session_id
                    player_id
                    start_time
                    end_time
                    rooms_cleared
                    total_shards_collected
                    numbered_shards_collected
                    entities_defeated
                    total_damage_dealt
                    total_damage_taken
                    doors_opened
                    deaths
                    session_complete
                    total_turns
                    total_actions
                    victory_achieved
                  }
                }
              }
            }
          `,
          variables: {
            sessionId,
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

      const sessionData = result.data?.gameSessions?.edges?.[0]?.node;
      setGameSession(sessionData);
      console.log("✅ Game session fetched:", sessionData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch game session");
      console.error("❌ Error fetching game session:", error);
      setError(error);
      setGameSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(sessionId);
  }, [sessionId, refetch]);

  return {
    gameSession,
    isLoading,
    error,
    refetch,
  };
}; 