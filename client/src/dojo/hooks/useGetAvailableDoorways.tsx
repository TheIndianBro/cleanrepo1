import { useState, useCallback, useEffect } from "react";
import { BigNumberish } from "starknet";
import { Doorway } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseGetAvailableDoorwaysReturn {
  doorways: Doorway[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (locationId: BigNumberish) => Promise<void>;
}

export const useGetAvailableDoorways = (locationId?: BigNumberish): UseGetAvailableDoorwaysReturn => {
  const [doorways, setDoorways] = useState<Doorway[] | null>(null);
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
            query GetAvailableDoorways($locationId: BigNumberish!) {
              getAvailableDoorways(locationId: $locationId) {
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

      const doorwaysData = result.data?.getAvailableDoorways || [];
      setDoorways(doorwaysData);
      console.log("✅ Available doorways fetched:", doorwaysData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch available doorways");
      console.error("❌ Error fetching available doorways:", error);
      setError(error);
      setDoorways(null);
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
    doorways,
    isLoading,
    error,
    refetch,
  };
}; 