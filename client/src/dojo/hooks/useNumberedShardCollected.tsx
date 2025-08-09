import { useState, useCallback, useEffect } from "react";
import { NumberedShardCollected } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseNumberedShardCollectedReturn {
  numberedShardCollected: NumberedShardCollected | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (eventId?: string) => Promise<void>;
}

export const useNumberedShardCollected = (eventId: string = "default"): UseNumberedShardCollectedReturn => {
  const [numberedShardCollected, setNumberedShardCollected] = useState<NumberedShardCollected | null>(null);
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
            query GetNumberedShardCollected($eventId: String!) {
              numberedShardCollectedEvents(where: { event_id: $eventId }) {
                edges {
                  node {
                    player_id
                    shard_type
                    position {
                      x
                      y
                      location_id
                    }
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

      const numberedShardCollectedData = result.data?.numberedShardCollectedEvents?.edges?.[0]?.node;
      setNumberedShardCollected(numberedShardCollectedData);
      console.log("✅ Numbered shard collected event fetched:", numberedShardCollectedData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch numbered shard collected event");
      console.error("❌ Error fetching numbered shard collected event:", error);
      setError(error);
      setNumberedShardCollected(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(eventId);
  }, [eventId, refetch]);

  return {
    numberedShardCollected,
    isLoading,
    error,
    refetch,
  };
}; 