import { useState, useCallback, useEffect } from "react";
import { ActionExecuted } from "../models.gen";
import { dojoConfig } from "../dojoConfig";

interface UseActionExecutedReturn {
  actionExecuted: ActionExecuted | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (eventId?: string) => Promise<void>;
}

export const useActionExecuted = (eventId: string = "default"): UseActionExecutedReturn => {
  const [actionExecuted, setActionExecuted] = useState<ActionExecuted | null>(null);
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
            query GetActionExecuted($eventId: String!) {
              actionExecutedEvents(where: { event_id: $eventId }) {
                edges {
                  node {
                    player_id
                    turn_id
                    action_index
                    action_type
                    success
                    damage_dealt
                    damage_taken
                    position_changed
                    door_opened
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

      const actionExecutedData = result.data?.actionExecutedEvents?.edges?.[0]?.node;
      setActionExecuted(actionExecutedData);
      console.log("✅ Action executed event fetched:", actionExecutedData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch action executed event");
      console.error("❌ Error fetching action executed event:", error);
      setError(error);
      setActionExecuted(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(eventId);
  }, [eventId, refetch]);

  return {
    actionExecuted,
    isLoading,
    error,
    refetch,
  };
}; 