import { useState, useCallback, useEffect } from "react";
import { Doorway } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseDoorwayReturn {
  doorway: Doorway | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (doorwayId?: string) => Promise<void>;
}

export const useDoorway = (doorwayId: string = "default"): UseDoorwayReturn => {
  const [doorway, setDoorway] = useState<Doorway | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (doorwayId: string = "default") => {
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
            query GetDoorway($doorwayId: String!) {
              doorways(where: { doorway_id: $doorwayId }) {
                edges {
                  node {
                    doorway_id
                    position {
                      x
                      y
                      location_id
                    }
                    room_id
                    connected_room_id
                    is_open
                    requires_cleared
                  }
                }
              }
            }
          `,
          variables: {
            doorwayId,
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

      const doorwayData = result.data?.doorways?.edges?.[0]?.node;
      setDoorway(doorwayData);
      console.log("✅ Doorway fetched:", doorwayData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch doorway");
      console.error("❌ Error fetching doorway:", error);
      setError(error);
      setDoorway(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(doorwayId);
  }, [doorwayId, refetch]);

  return {
    doorway,
    isLoading,
    error,
    refetch,
  };
}; 