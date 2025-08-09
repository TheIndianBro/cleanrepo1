import { useState, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { Account, BigNumberish } from "starknet";
import { useDojoSDK } from "@dojoengine/sdk/react";

interface UseOpenDoorReturn {
  openDoor: (doorId: BigNumberish) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  resetError: () => void;
}

export const useOpenDoor = (): UseOpenDoorReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useAccount();
  const { client } = useDojoSDK();

  const openDoor = useCallback(async (doorId: BigNumberish) => {
    if (!account) {
      setError(new Error("No account connected"));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("📤 Executing open door transaction...");
      const tx = await client.game.openDoor(account as Account, doorId);
      console.log("📥 Open door tx response:", tx);

      if (tx?.transaction_hash) {
        console.log("🔗 Tx hash:", tx.transaction_hash);
      }

      if (!tx || tx.code !== "SUCCESS") {
        throw new Error(`Open door failed with code: ${tx?.code || "unknown"}`);
      }
      console.log("✅ Door opened successfully");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to open door");
      console.error("❌ Error opening door:", error);
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
    openDoor,
    isLoading,
    error,
    resetError,
  };
}; 