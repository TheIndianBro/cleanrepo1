import { useState, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { Account } from "starknet";
import { Position } from "../models.gen";
import { useDojoSDK } from "@dojoengine/sdk/react";

interface UseCollectShardReturn {
  collectShard: (position: Position) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  resetError: () => void;
}

export const useCollectShard = (): UseCollectShardReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useAccount();
  const { client } = useDojoSDK();

  const collectShard = useCallback(async (position: Position) => {
    if (!account) {
      setError(new Error("No account connected"));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("📤 Executing collect shard transaction...");
      const tx = await client.game.collectShard(account as Account, position);
      console.log("📥 Collect shard tx response:", tx);

      if (tx?.transaction_hash) {
        console.log("🔗 Tx hash:", tx.transaction_hash);
      }

      if (!tx || tx.code !== "SUCCESS") {
        throw new Error(`Collect shard failed with code: ${tx?.code || "unknown"}`);
      }
      console.log("✅ Shard collected successfully");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to collect shard");
      console.error("❌ Error collecting shard:", error);
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
    collectShard,
    isLoading,
    error,
    resetError,
  };
}; 