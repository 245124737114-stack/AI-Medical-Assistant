import { useEffect, useState } from "react";
import { fetchProtectedBlob } from "@/services/api";

export function useBlobUrl(apiPath: string | null) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!apiPath) {
      setBlobUrl(null);
      return;
    }
    let active = true;
    let createdUrl: string | null = null;
    setLoading(true);
    setError(null);

    fetchProtectedBlob(apiPath)
      .then(({ blob }) => {
        if (!active) return;
        createdUrl = URL.createObjectURL(blob);
        setBlobUrl(createdUrl);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [apiPath]);

  return { blobUrl, error, loading };
}
