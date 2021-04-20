import { useCallback, useState } from 'react';

export default function useCredentials() {
  const getCredentials = () => {
    const credentialsJson = localStorage.getItem('credentials');
    return JSON.parse(credentialsJson);
  };

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
