import { useCallback } from "react";
import { AlertLevelEnum, alertLevel } from "../models.gen";

interface UseAlertLevelReturn {
  alertLevels: typeof alertLevel;
  getAlertLevelName: (level: AlertLevelEnum) => string;
  isIdle: (level: AlertLevelEnum) => boolean;
  isAlerted: (level: AlertLevelEnum) => boolean;
  isCombat: (level: AlertLevelEnum) => boolean;
}

export const useAlertLevel = (): UseAlertLevelReturn => {
  const getAlertLevelName = useCallback((level: AlertLevelEnum): string => {
    if ('Idle' in level) return "Idle";
    if ('Alerted' in level) return "Alerted";
    if ('Combat' in level) return "Combat";
    return "Unknown";
  }, []);

  const isIdle = useCallback((level: AlertLevelEnum): boolean => {
    return 'Idle' in level;
  }, []);

  const isAlerted = useCallback((level: AlertLevelEnum): boolean => {
    return 'Alerted' in level;
  }, []);

  const isCombat = useCallback((level: AlertLevelEnum): boolean => {
    return 'Combat' in level;
  }, []);

  return {
    alertLevels: alertLevel,
    getAlertLevelName,
    isIdle,
    isAlerted,
    isCombat,
  };
}; 