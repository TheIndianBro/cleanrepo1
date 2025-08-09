import { useState, useCallback, useEffect } from "react";
import { RoomCleared } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseRoomClearedReturn {
  roomCleared: RoomCleared | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (eventId?: string) => Promise<void>;
}

export const useRoomCleared = (eventId: string = "default"): UseRoomClearedReturn => {
  const [roomCleared, setRoomCleared] = useState<RoomCleared | null>(null);
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
            query GetRoomCleared($eventId: String!) {
              roomClearedEvents(where: { event_id: $eventId }) {
                edges {
                  node {
                    player_id
                    room_id
                    entities_defeated
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

      const roomClearedData = result.data?.roomClearedEvents?.edges?.[0]?.node;
      setRoomCleared(roomClearedData);
      console.log("✅ Room cleared event fetched:", roomClearedData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch room cleared event");
      console.error("❌ Error fetching room cleared event:", error);
      setError(error);
      setRoomCleared(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(eventId);
  }, [eventId, refetch]);

  return {
    roomCleared,
    isLoading,
    error,
    refetch,
  };
}; 