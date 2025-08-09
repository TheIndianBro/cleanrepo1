import { useState, useCallback, useEffect } from "react";
import { BigNumberish } from "starknet";
import { Entity } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseEntityReturn {
  entity: Entity | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (entityId: BigNumberish) => Promise<void>;
}

export const useEntity = (entityId?: BigNumberish): UseEntityReturn => {
  const [entity, setEntity] = useState<Entity | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (entityId: BigNumberish) => {
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
            query GetEntity($entityId: BigNumberish!) {
              entities(where: { entity_id: $entityId }) {
                edges {
                  node {
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
              }
            }
          `,
          variables: {
            entityId: entityId.toString(),
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

      const entityData = result.data?.entities?.edges?.[0]?.node;
      setEntity(entityData);
      console.log("✅ Entity fetched:", entityData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch entity");
      console.error("❌ Error fetching entity:", error);
      setError(error);
      setEntity(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (entityId) {
      refetch(entityId);
    }
  }, [entityId, refetch]);

  return {
    entity,
    isLoading,
    error,
    refetch,
  };
}; 