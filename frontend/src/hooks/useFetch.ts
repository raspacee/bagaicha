import { useState } from "react";

import { FetchState } from "../lib/enums";
import type { FetchOptionType } from "../lib/types";

export default function useFetch() {
  const [fetchState, setState] = useState<FetchState>(FetchState.FETCHING);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  async function fetchHook(url: string, options: FetchOptionType) {
    setState(FetchState.FETCHING);
    try {
      const res = await fetch(url, {
        mode: "cors",
        method: options.method,
        body: options.body || null,
        headers: options.headers || {},
      });
      const data = await res.json();
      if (data.status == "ok") {
        setState(FetchState.COMPLETED);
        return data;
      } else throw new Error(data.message);
    } catch (err) {
      setFetchErr(err as string);
      setState(FetchState.ERROR);
    }
  }

  return [fetchState, fetchHook, fetchErr] as const;
}
