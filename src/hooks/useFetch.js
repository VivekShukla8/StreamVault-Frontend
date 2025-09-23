import { useEffect, useState } from "react";

export default function useFetch(promiseFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    promiseFn()
      .then((res) => mounted && setData(res?.data?.data || res?.data || res))
      .catch((err) => mounted && setError(err))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, deps);

  return { data, loading, error };
}
