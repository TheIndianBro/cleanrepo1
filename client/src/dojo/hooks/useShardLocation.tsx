import { useState, useCallback, useEffect } from "react";
import { BigNumberish } from "starknet";
import { ShardLocation } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseShardLocationReturn {
  shardLocation: ShardLocation | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (locationId: BigNumberish) => Promise<void>;
}

export const useShardLocation = (locationId?: BigNumberish): UseShardLocationReturn => {
  const [shardLocation, setShardLocation] = useState<ShardLocation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (locationId: BigNumberish) => {
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
            query GetShardLocation($locationId: BigNumberish!) {
              shardLocations(where: { location_id: $locationId }) {
                edges {
                  node {
                    location_id
                    position {
                      x
                      y
                      location_id
                    }
                    numbered_shard
                    collected
                  }
                }
              }
            }
          `,
          variables: {
            locationId: locationId.toString(),
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

      const shardData = result.data?.shardLocations?.edges?.[0]?.node;
      setShardLocation(shardData);
      console.log("✅ Shard location fetched:", shardData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch shard location");
      console.error("❌ Error fetching shard location:", error);
      setError(error);
      setShardLocation(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (locationId) {
      refetch(locationId);
    }
  }, [locationId, refetch]);

  return {
    shardLocation,
    isLoading,
    error,
    refetch,
  };
}; 