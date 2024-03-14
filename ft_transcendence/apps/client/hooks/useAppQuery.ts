import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useEffect, useMemo, useRef } from "react";

function useAppQuery(
  queryKey: string[],
  queryFn: (...a: any) => Promise<AxiosResponse<any, any>>,
  options: {
    enabled?: boolean;
  },
  conf: {
    param: {
      isParam: true;
      paramIndex: number;
    };
    args: any[];
  }
) {
  const queryRef = useRef<{ isError: boolean; isSuccess: boolean }>({
    isError: false,
    isSuccess: false,
  });
  const { data, ...query } = useQuery({retry:0,
    queryKey,
    throwOnError: false,
    ...options,
    queryFn: async ({ queryKey }) => {
      try {
        if (conf.param.isParam) {
          const res = await queryFn(
            queryKey[conf.param.paramIndex],
            ...conf.args
          );
          return res;
        }
        const res = await queryFn(...conf.args);
        return res;
      } catch (error: any) {
        return {
          error: true,
          message:
            "message" in error ? error.message : "Error Occured in Query.",
        };
      }
    },
  });

  useEffect(() => {
    if (data && "error" in data!) {
      queryRef.current.isSuccess = false;
      queryRef.current.isError = true;
    }
  }, [data]);

  const returnQuery = useMemo(() => {
    return {
      ...query,
      isError: queryRef.current.isError,
      isSuccess: queryRef.current.isSuccess,
      data,
    };
  }, [query, data]);

  return returnQuery;
}

export default useAppQuery;
