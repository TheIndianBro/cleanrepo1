import { useState, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { Account } from "starknet";

interface UseInitializePlayerReturn {
  initializePlayer: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  resetError: () => void;
}

export const useInitializePlayer = (): UseInitializePlayerReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useAccount();
  const { client } = useDojoSDK();

  const initializePlayer = useCallback(async () => {
    if (!account) {
      setError(new Error("No account connected"));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("📤 Executing initialize player transaction...");
      const tx = await client.game.initializePlayer(account as Account);
      console.log("📥 Initialize player tx response:", tx);

      if (tx?.transaction_hash) {
        console.log("🔗 Tx hash:", tx.transaction_hash);
      }

      if (!tx || tx.code !== "SUCCESS") {
        throw new Error(`Initialize player failed with code: ${tx?.code || "unknown"}`);
      }
      console.log("✅ Player initialized successfully");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to initialize player");
      console.error("❌ Error initializing player:", error);
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
    initializePlayer,
    isLoading,
    error,
    resetError,
  };
}; 