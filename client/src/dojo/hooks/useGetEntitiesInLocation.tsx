import { useState, useCallback, useEffect } from "react";
import { BigNumberish } from "starknet";
import { Entity } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseGetEntitiesInLocationReturn {
  entities: Entity[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (locationId: BigNumberish) => Promise<void>;
}

export const useGetEntitiesInLocation = (locationId?: BigNumberish): UseGetEntitiesInLocationReturn => {
  const [entities, setEntities] = useState<Entity[] | null>(null);
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
            query GetEntitiesInLocation($locationId: BigNumberish!) {
              getEntitiesInLocation(locationId: $locationId) {
                entity_id
                entity_type
                position {
                  x
                  y
                  location_id
                }
                health
                max_health
                is_alive
                damage_per_turn
                drops_numbered_shard
                spawned_from_door
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

      const entitiesData = result.data?.getEntitiesInLocation || [];
      setEntities(entitiesData);
      console.log("✅ Entities in location fetched:", entitiesData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch entities in location");
      console.error("❌ Error fetching entities in location:", error);
      setError(error);
      setEntities(null);
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
    entities,
    isLoading,
    error,
    refetch,
  };
}; 