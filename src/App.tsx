import { useCallback, useState } from 'react';
import { ipcRenderer } from 'electron';
import { IpcActions } from './lib/IpcActions';
import IAppStrategy from './lib/IAppStrategy';
import useCredentials from './hooks/useCredentials';
import './styles/App.css';
import LoggedInStrategy from './lib/LoggedInStrategy';
import NotLoggedInStrategy from './lib/NotLoggedInStrategy';

function App() {
  const [credentials, setCredentials] = useCredentials();
  const [selectedMessageUID, setSelectedMessageUID] = useState();
  const [errorMessage, setErrorMessage] = useState();

  const logout = useCallback(
    (errorMessage) => {
      ipcRenderer.invoke(IpcActions.LOGOUT);
      setCredentials(undefined);
      setErrorMessage(errorMessage);
      setSelectedMessageUID(undefined);
    },
    [setCredentials]
  );

  let loginState: IAppStrategy;
  if (credentials) {
    loginState = new LoggedInStrategy();
  } else {
    loginState = new NotLoggedInStrategy();
  }

  const props = {
    credentials,
    setCredentials,
    selectedMessageUID,
    setSelectedMessageUID,
    errorMessage,
    setErrorMessage,
    logout,
  };

  return loginState.render(props);
}

export default App;
