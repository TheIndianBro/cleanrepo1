import { useState, useCallback, useEffect } from "react";
import { BigNumberish } from "starknet";
import { Room } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseRoomReturn {
  room: Room | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (roomId: BigNumberish) => Promise<void>;
}

export const useRoom = (roomId?: BigNumberish): UseRoomReturn => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (roomId: BigNumberish) => {
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
            query GetRoom($roomId: BigNumberish!) {
              rooms(where: { room_id: $roomId }) {
                edges {
                  node {
                    room_id
                    initialized
                    cleared
                    entity_count
                    active_entities
                    has_treasure
                    treasure_collected
                    door_count
                    boundaries {
                      min_x
                      max_x
                      min_y
                      max_y
                    }
                  }
                }
              }
            }
          `,
          variables: {
            roomId: roomId.toString(),
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

      const roomData = result.data?.rooms?.edges?.[0]?.node;
      setRoom(roomData);
      console.log("✅ Room fetched:", roomData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch room");
      console.error("❌ Error fetching room:", error);
      setError(error);
      setRoom(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (roomId) {
      refetch(roomId);
    }
  }, [roomId, refetch]);

  return {
    room,
    isLoading,
    error,
    refetch,
  };
}; 