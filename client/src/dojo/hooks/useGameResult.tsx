import { useCallback } from "react";
import { GameResultEnum, gameResult } from "../models.gen";

interface UseGameResultReturn {
  gameResults: typeof gameResult;
  getGameResultName: (result: GameResultEnum) => string;
  isInProgress: (result: GameResultEnum) => boolean;
  isVictory: (result: GameResultEnum) => boolean;
  isDefeat: (result: GameResultEnum) => boolean;
}

export const useGameResult = (): UseGameResultReturn => {
  const getGameResultName = useCallback((result: GameResultEnum): string => {
    if (result.activeVariant() === "InProgress") return "InProgress";
    if (result.activeVariant() === "Victory") return "Victory";
    if (result.activeVariant() === "Defeat") return "Defeat";
    return "Unknown";
  }, []);

  const isInProgress = useCallback((result: GameResultEnum): boolean => {
    return result.activeVariant() === "InProgress";
  }, []);

  const isVictory = useCallback((result: GameResultEnum): boolean => {
    return result.activeVariant() === "Victory";
  }, []);

  const isDefeat = useCallback((result: GameResultEnum): boolean => {
    return result.activeVariant() === "Defeat";
  }, []);

  return {
    gameResults: gameResult,
    getGameResultName,
    isInProgress,
    isVictory,
    isDefeat,
  };
}; 