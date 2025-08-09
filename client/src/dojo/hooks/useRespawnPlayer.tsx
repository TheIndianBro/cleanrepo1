import { useState, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { Account } from "starknet";

interface UseRespawnPlayerReturn {
  respawnPlayer: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  resetError: () => void;
}

export const useRespawnPlayer = (): UseRespawnPlayerReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useAccount();
  const { client } = useDojoSDK();

  const respawnPlayer = useCallback(async () => {
    if (!account) {
      setError(new Error("No account connected"));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("📤 Executing respawn player transaction...");
      const tx = await client.game.respawnPlayer(account as Account);
      console.log("📥 Respawn player tx response:", tx);

      if (tx?.transaction_hash) {
        console.log("🔗 Tx hash:", tx.transaction_hash);
      }

      if (!tx || tx.code !== "SUCCESS") {
        throw new Error(`Respawn player failed with code: ${tx?.code || "unknown"}`);
      }
      console.log("✅ Player respawned successfully");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to respawn player");
      console.error("❌ Error respawning player:", error);
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
    respawnPlayer,
    isLoading,
    error,
    resetError,
  };
}; 