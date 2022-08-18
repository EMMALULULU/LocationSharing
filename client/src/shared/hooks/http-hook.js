import axios from 'axios';
import { useState, useCallback, useRef, useEffect } from 'react';

export function useHttpClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const activeHttpRequests = useRef([]);

  const sendRequest = useCallback(async (config) => {
    setIsLoading(true);
    const httpAbortCtrl = new AbortController();
    activeHttpRequests.current.push(httpAbortCtrl);
    try {
      const response = await axios({ ...config, signal: httpAbortCtrl.signal });
      activeHttpRequests.current = activeHttpRequests.current.filter(
        (reqCtrl) => reqCtrl !== httpAbortCtrl
      );
      setIsLoading(false);

      return response;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled', error.message);
      }
      setIsLoading(false);
      const errorMsg = error.response.data.message;
      setError(errorMsg);
      throw error;
    }
  }, []);

  function clearError() {
    setError(null);
  }

  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
}
/*{
        method,
        url,
        data: body,
        signal: httpAbortCtrl.signal,
      }
    */
