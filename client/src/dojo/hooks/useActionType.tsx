import { useCallback } from "react";
import { ActionTypeEnum, actionType } from "../models.gen";

interface UseActionTypeReturn {
  actionTypes: typeof actionType;
  getActionTypeName: (type: ActionTypeEnum) => string;
  isMove: (type: ActionTypeEnum) => boolean;
  isOpenDoor: (type: ActionTypeEnum) => boolean;
  isAttack: (type: ActionTypeEnum) => boolean;
  isCollectShard: (type: ActionTypeEnum) => boolean;
}

export const useActionType = (): UseActionTypeReturn => {
  const getActionTypeName = useCallback((type: ActionTypeEnum): string => {
    if (type.variant.Move !== undefined) return "Move";
    if (type.variant.OpenDoor !== undefined) return "OpenDoor";
    if (type.variant.Attack !== undefined) return "Attack";
    if (type.variant.CollectShard !== undefined) return "CollectShard";
    return "Unknown";
  }, []);

  const isMove = useCallback((type: ActionTypeEnum): boolean => {
    return type.variant.Move !== undefined;
  }, []);

  const isOpenDoor = useCallback((type: ActionTypeEnum): boolean => {
    return type.variant.OpenDoor !== undefined;
  }, []);

  const isAttack = useCallback((type: ActionTypeEnum): boolean => {
    return type.variant.Attack !== undefined;
  }, []);

  const isCollectShard = useCallback((type: ActionTypeEnum): boolean => {
    return type.variant.CollectShard !== undefined;
  }, []);

  return {
    actionTypes: actionType,
    getActionTypeName,
    isMove,
    isOpenDoor,
    isAttack,
    isCollectShard,
  };
}; 