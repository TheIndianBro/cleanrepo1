import { useState, useCallback, useEffect } from "react";
import { GameResultEnum } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseGetGameStatusReturn {
  gameStatus: GameResultEnum | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useGetGameStatus = (): UseGetGameStatusReturn => {
  const [gameStatus, setGameStatus] = useState<GameResultEnum | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
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
            query GetGameStatus {
              getGameStatus
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const status = result.data?.getGameStatus;
      setGameStatus(status);
      console.log("✅ Game status fetched:", status);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch game status");
      console.error("❌ Error fetching game status:", error);
      setError(error);
      setGameStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    gameStatus,
    isLoading,
    error,
    refetch,
  };
}; 