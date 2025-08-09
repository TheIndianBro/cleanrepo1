import { useState, useCallback, useEffect } from "react";
import { GridBounds } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseGridBoundsReturn {
  gridBounds: GridBounds | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (boundsId?: string) => Promise<void>;
}

export const useGridBounds = (boundsId: string = "default"): UseGridBoundsReturn => {
  const [gridBounds, setGridBounds] = useState<GridBounds | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (boundsId: string = "default") => {
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
            query GetGridBounds($boundsId: String!) {
              gridBounds(where: { bounds_id: $boundsId }) {
                edges {
                  node {
                    min_x
                    max_x
                    min_y
                    max_y
                  }
                }
              }
            }
          `,
          variables: {
            boundsId,
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

      const gridBoundsData = result.data?.gridBounds?.edges?.[0]?.node;
      setGridBounds(gridBoundsData);
      console.log("✅ Grid bounds fetched:", gridBoundsData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch grid bounds");
      console.error("❌ Error fetching grid bounds:", error);
      setError(error);
      setGridBounds(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(boundsId);
  }, [boundsId, refetch]);

  return {
    gridBounds,
    isLoading,
    error,
    refetch,
  };
}; 