import { useCallback, useState } from 'react';

export default function useCredentials() {
  const getCredentials = () => {
    const credentialsJson = localStorage.getItem('credentials');
    return JSON.parse(credentialsJson);
  };

  const [credentials, setCredentials] = useState(getCredentials());

  const saveCredentials = useCallback((credentials) => {
    localStorage.setItem('credentials', JSON.stringify(credentials));
    setCredentials(credentials);
  }, []);

  const removeCredentials = useCallback(() => {
    localStorage.removeItem('credentials');
    setCredentials(undefined);
  }, []);

  return [credentials, saveCredentials, removeCredentials];
}
