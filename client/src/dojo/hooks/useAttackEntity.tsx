import { useState, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { Account, BigNumberish } from "starknet";
import { useDojoSDK } from "@dojoengine/sdk/react";

interface UseAttackEntityReturn {
  attackEntity: (entityId: BigNumberish) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  resetError: () => void;
}

export const useAttackEntity = (): UseAttackEntityReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useAccount();
  const { client } = useDojoSDK();

  const attackEntity = useCallback(async (entityId: BigNumberish) => {
    if (!account) {
      setError(new Error("No account connected"));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("📤 Executing attack entity transaction...");
      const tx = await client.game.attackEntity(account as Account, entityId);
      console.log("📥 Attack entity tx response:", tx);

      if (tx?.transaction_hash) {
        console.log("🔗 Tx hash:", tx.transaction_hash);
      }

      if (!tx || tx.code !== "SUCCESS") {
        throw new Error(`Attack entity failed with code: ${tx?.code || "unknown"}`);
      }
      console.log("✅ Entity attacked successfully");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to attack entity");
      console.error("❌ Error attacking entity:", error);
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
    attackEntity,
    isLoading,
    error,
    resetError,
  };
}; 