import { useState, useCallback, useEffect } from "react";
import { BigNumberish } from "starknet";
import { Room } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseGetRoomStateReturn {
  roomState: Room | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (roomId: BigNumberish) => Promise<void>;
}

export const useGetRoomState = (roomId?: BigNumberish): UseGetRoomStateReturn => {
  const [roomState, setRoomState] = useState<Room | null>(null);
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
            query GetRoomState($roomId: BigNumberish!) {
              getRoomState(roomId: $roomId) {
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

      const roomData = result.data?.getRoomState;
      setRoomState(roomData);
      console.log("✅ Room state fetched:", roomData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch room state");
      console.error("❌ Error fetching room state:", error);
      setError(error);
      setRoomState(null);
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
    roomState,
    isLoading,
    error,
    refetch,
  };
}; 