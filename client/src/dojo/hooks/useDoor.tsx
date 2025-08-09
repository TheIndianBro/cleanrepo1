import { useState, useCallback, useEffect } from "react";
import { BigNumberish } from "starknet";
import { Door } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseDoorReturn {
  door: Door | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (doorId: BigNumberish) => Promise<void>;
}

export const useDoor = (doorId?: BigNumberish): UseDoorReturn => {
  const [door, setDoor] = useState<Door | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (doorId: BigNumberish) => {
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
            query GetDoor($doorId: BigNumberish!) {
              doors(where: { door_id: $doorId }) {
                edges {
                  node {
                    door_id
                    position {
                      x
                      y
                      location_id
                    }
                    room_id
                    connected_room_id
                    is_open
                    requires_key
                    requires_cleared
                  }
                }
              }
            }
          `,
          variables: {
            doorId: doorId.toString(),
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

      const doorData = result.data?.doors?.edges?.[0]?.node;
      setDoor(doorData);
      console.log("✅ Door fetched:", doorData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch door");
      console.error("❌ Error fetching door:", error);
      setError(error);
      setDoor(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (doorId) {
      refetch(doorId);
    }
  }, [doorId, refetch]);

  return {
    door,
    isLoading,
    error,
    refetch,
  };
}; 