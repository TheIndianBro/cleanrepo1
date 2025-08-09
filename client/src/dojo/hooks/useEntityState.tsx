import { useState, useCallback, useEffect } from "react";
import { EntityState } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseEntityStateReturn {
  entityState: EntityState | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (entityId?: string) => Promise<void>;
}

export const useEntityState = (entityId: string = "default"): UseEntityStateReturn => {
  const [entityState, setEntityState] = useState<EntityState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (entityId: string = "default") => {
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
            query GetEntityState($entityId: String!) {
              entityStates(where: { entity_id: $entityId }) {
                edges {
                  node {
                    entity_id
                    alert_level
                    detection_range
                    last_seen_player_pos {
                      x
                      y
                      location_id
                    }
                    patrol_path_index
                    last_action_block
                  }
                }
              }
            }
          `,
          variables: {
            entityId,
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

      const entityStateData = result.data?.entityStates?.edges?.[0]?.node;
      setEntityState(entityStateData);
      console.log("✅ Entity state fetched:", entityStateData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch entity state");
      console.error("❌ Error fetching entity state:", error);
      setError(error);
      setEntityState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(entityId);
  }, [entityId, refetch]);

  return {
    entityState,
    isLoading,
    error,
    refetch,
  };
}; 