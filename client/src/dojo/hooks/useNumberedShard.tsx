import { useCallback } from "react";
import { NumberedShardEnum, numberedShard } from"../models.gen";

interface UseNumberedShardReturn {
  numberedShards: typeof numberedShard;
  getShardName: (shard: NumberedShardEnum) => string;
  isOne: (shard: NumberedShardEnum) => boolean;
  isTwo: (shard: NumberedShardEnum) => boolean;
  isThree: (shard: NumberedShardEnum) => boolean;
}

export const useNumberedShard = (): UseNumberedShardReturn => {
  const getShardName = useCallback((shard: NumberedShardEnum): string => {
    if ('One' in shard) return "One";
    if ('Two' in shard) return "Two";
    if ('Three' in shard) return "Three";
    return "Unknown";
  }, []);

  const isOne = useCallback((shard: NumberedShardEnum): boolean => {
    return 'One' in shard;
  }, []);

  const isTwo = useCallback((shard: NumberedShardEnum): boolean => {
    return 'Two' in shard;
  }, []);

  const isThree = useCallback((shard: NumberedShardEnum): boolean => {
    return 'Three' in shard;
  }, []);

  return {
    numberedShards: numberedShard,
    getShardName,
    isOne,
    isTwo,
    isThree,
  };
}; 