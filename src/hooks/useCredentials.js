import { useCallback, useState } from 'react';

function getCredentials() {
  const credentialsJson = localStorage.getItem('credentials');
  return JSON.parse(credentialsJson);
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
