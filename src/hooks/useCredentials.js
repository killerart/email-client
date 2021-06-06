import { useCallback, useState } from 'react';

function getCredentials() {
  return JSON.parse(localStorage.getItem('credentials'));
}

function useCredentials() {
  const [credentials, setCredentials] = useState(getCredentials());

  const saveCredentials = useCallback((credentials) => {
    if (credentials) {
      localStorage.setItem('credentials', JSON.stringify(credentials));
    } else {
      localStorage.removeItem('credentials');
    }
    setCredentials(credentials);
  }, []);

  return [credentials, saveCredentials];
}

export default useCredentials;
