import { useState, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { Account } from "starknet";

interface UseStartGameReturn {
  startGame: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  resetError: () => void;
}

export const useStartGame = (): UseStartGameReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useAccount();
  const { client } = useDojoSDK();

  const startGame = useCallback(async () => {
    if (!account) {
      setError(new Error("No account connected"));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("📤 Executing start game transaction...");
      const tx = await client.game.startGame(account as Account);
      console.log("📥 Start game tx response:", tx);

      if (tx?.transaction_hash) {
        console.log("🔗 Tx hash:", tx.transaction_hash);
      }

      if (!tx || tx.code !== "SUCCESS") {
        throw new Error(`Start game failed with code: ${tx?.code || "unknown"}`);
      }
      console.log("✅ Game started successfully");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to start game");
      console.error("❌ Error starting game:", error);
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
    startGame,
    isLoading,
    error,
    resetError,
  };
}; 