import { useState, useCallback, useRef } from 'react';

interface UseAsyncOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (msg: string) => void;
}

export function useAsync<T>(
  asyncFn: (...args: unknown[]) => Promise<T>,
  options: UseAsyncOptions = {},
) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const mounted = useRef(true);

  const execute = useCallback(
    async (...args: unknown[]) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFn(...args);
        if (mounted.current) options.onSuccess?.(result);
        return result;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Đã xảy ra lỗi';
        if (mounted.current) {
          setError(msg);
          options.onError?.(msg);
        }
      } finally {
        if (mounted.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asyncFn],
  );

  return { loading, error, execute };
}
