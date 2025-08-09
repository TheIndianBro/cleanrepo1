import { useState, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { Account, BigNumberish } from "starknet";
import { useDojoSDK } from "@dojoengine/sdk/react";

interface UseMovePlayerReturn {
  movePlayer: (xDelta: BigNumberish, yDelta: BigNumberish) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  resetError: () => void;
}

export const useMovePlayer = (): UseMovePlayerReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useAccount();
  const { client } = useDojoSDK();

  const movePlayer = useCallback(async (xDelta: BigNumberish, yDelta: BigNumberish) => {
    if (!account) {
      setError(new Error("No account connected"));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("📤 Executing move player transaction...");
      const tx = await client.game.movePlayer(account as Account, xDelta, yDelta);
      console.log("📥 Move player tx response:", tx);

      if (tx?.transaction_hash) {
        console.log("🔗 Tx hash:", tx.transaction_hash);
      }

      if (!tx || tx.code !== "SUCCESS") {
        throw new Error(`Move player failed with code: ${tx?.code || "unknown"}`);
      }
      console.log("✅ Player moved successfully");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to move player");
      console.error("❌ Error moving player:", error);
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
    movePlayer,
    isLoading,
    error,
    resetError,
  };
}; 