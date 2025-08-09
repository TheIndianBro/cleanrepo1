import { useState, useCallback, useEffect } from "react";
import { Position } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UsePositionReturn {
  position: Position | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (positionId?: string) => Promise<void>;
}

export const usePosition = (positionId: string = "default"): UsePositionReturn => {
  const [position, setPosition] = useState<Position | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (positionId: string = "default") => {
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
            query GetPosition($positionId: String!) {
              positions(where: { position_id: $positionId }) {
                edges {
                  node {
                    x
                    y
                    location_id
                  }
                }
              }
            }
          `,
          variables: {
            positionId,
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

      const positionData = result.data?.positions?.edges?.[0]?.node;
      setPosition(positionData);
      console.log("✅ Position fetched:", positionData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch position");
      console.error("❌ Error fetching position:", error);
      setError(error);
      setPosition(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(positionId);
  }, [positionId, refetch]);

  return {
    position,
    isLoading,
    error,
    refetch,
  };
}; 