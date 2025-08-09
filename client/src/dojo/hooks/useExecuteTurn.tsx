import { useState, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { Account } from "starknet";

// Define Action type based on the contract structure
interface Action {
  // This would be based on your Action enum from the contract
  type: string;
  data: any;
}

interface UseExecuteTurnReturn {
  executeTurn: (actions: Action[]) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  resetError: () => void;
}

export const useExecuteTurn = (): UseExecuteTurnReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useAccount();
  const { client } = useDojoSDK();

  const executeTurn = useCallback(async (actions: Action[]) => {
    if (!account) {
      setError(new Error("No account connected"));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("📤 Executing turn transaction...");
      const tx = await client.game.executeTurn(account as Account, actions);
      console.log("📥 Execute turn tx response:", tx);

      if (tx?.transaction_hash) {
        console.log("🔗 Tx hash:", tx.transaction_hash);
      }

      if (!tx || tx.code !== "SUCCESS") {
        throw new Error(`Execute turn failed with code: ${tx?.code || "unknown"}`);
      }
      console.log("✅ Turn executed successfully");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to execute turn");
      console.error("❌ Error executing turn:", error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [account, client.game]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    executeTurn,
    isLoading,
    error,
    resetError,
  };
}; 