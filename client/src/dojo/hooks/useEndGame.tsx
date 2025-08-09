import { useState, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { Account } from "starknet";

interface UseEndGameReturn {
  endGame: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  resetError: () => void;
}

export const useEndGame = (): UseEndGameReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useAccount();
  const { client } = useDojoSDK();

  const endGame = useCallback(async () => {
    if (!account) {
      setError(new Error("No account connected"));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("📤 Executing end game transaction...");
      const tx = await client.game.endGame(account as Account);
      console.log("📥 End game tx response:", tx);

      if (tx?.transaction_hash) {
        console.log("🔗 Tx hash:", tx.transaction_hash);
      }

      if (!tx || tx.code !== "SUCCESS") {
        throw new Error(`End game failed with code: ${tx?.code || "unknown"}`);
      }
      console.log("✅ Game ended successfully");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to end game");
      console.error("❌ Error ending game:", error);
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
    endGame,
    isLoading,
    error,
    resetError,
  };
}; 