import { useCallback, useEffect, useState } from 'react';

import { getUserFacingErrorMessage } from '@/lib/http/api-error';
import { authorService } from '@/services/author-service';
import type { AsyncResource } from '@/types/api';
import type { Author } from '@/types/author';

type AuthorsState = AsyncResource<Author[]>;

export function useAuthors() {
  const [state, setState] = useState<AuthorsState>({ status: 'idle', data: [] });

  const load = useCallback(async () => {
    setState((current) => ({ status: 'loading', data: current.data }));

    try {
      const response = await authorService.list();

      setState({
        status: response.data.length > 0 ? 'success' : 'empty',
        data: response.data,
      });
    } catch (error) {
      setState({
        status: 'error',
        data: [],
        message: getUserFacingErrorMessage(error),
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...state,
    retry: load,
  };
}
