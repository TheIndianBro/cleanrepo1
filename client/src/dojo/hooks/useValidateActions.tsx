import { useState, useCallback } from "react";
import { dojoConfig } from "../dojoConfig";

// Define Action type based on the contract structure
interface Action {
  // This would be based on your Action enum from the contract
  type: string;
  data: any;
}

interface ActionValidation {
  validation_id: string;
  player_id: string;
  action_index: number;
  action_type: string;
  is_valid: boolean;
  error_reason: string;
  required_shards: number;
  required_health: number;
  required_position: {
    x: number;
    y: number;
    location_id: number;
  };
}

interface UseValidateActionsReturn {
  validateActions: (actions: Action[]) => Promise<ActionValidation[]>;
  isLoading: boolean;
  error: Error | null;
  resetError: () => void;
}

export const useValidateActions = (): UseValidateActionsReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const validateActions = useCallback(async (actions: Action[]): Promise<ActionValidation[]> => {
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
            query ValidateActions($actions: [Action!]!) {
              validateActions(actions: $actions) {
                validation_id
                player_id
                action_index
                action_type
                is_valid
                error_reason
                required_shards
                required_health
                required_position {
                  x
                  y
                  location_id
                }
              }
            }
          `,
          variables: {
            actions: actions.map(action => ({
              type: action.type,
              data: action.data,
            })),
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

      const validations = result.data?.validateActions || [];
      console.log("✅ Actions validated:", validations);
      return validations;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to validate actions");
      console.error("❌ Error validating actions:", error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    validateActions,
    isLoading,
    error,
    resetError,
  };
}; 