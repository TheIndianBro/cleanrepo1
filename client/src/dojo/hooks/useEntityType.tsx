import { useCallback } from "react";
import { EntityTypeEnum, entityType } from "../models.gen";

interface UseEntityTypeReturn {
  entityTypes: typeof entityType;
  getEntityTypeName: (type: EntityTypeEnum) => string;
  isMale: (type: EntityTypeEnum) => boolean;
  isFemale: (type: EntityTypeEnum) => boolean;
}

export const useEntityType = (): UseEntityTypeReturn => {
  const getEntityTypeName = useCallback((type: EntityTypeEnum): string => {
    if ('Male' in type) return "Male";
    if ('Female' in type) return "Female";
    return "Unknown";
  }, []);

  const isMale = useCallback((type: EntityTypeEnum): boolean => {
    return 'Male' in type;
  }, []);

  const isFemale = useCallback((type: EntityTypeEnum): boolean => {
    return 'Female' in type;
  }, []);

  return {
    entityTypes: entityType,
    getEntityTypeName,
    isMale,
    isFemale,
  };
}; 