import React, { useCallback, useState } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Logout from './components/Logout';
import Message from './components/Message';
import Send from './components/Send';
import { IpcActions } from './lib/IpcActions';
import useCredentials from './hooks/useCredentials';
import './styles/App.css';

function App() {
  const [credentials, setCredentials, removeCredentials] = useCredentials();
  const [selectedMessageUID, setSelectedMessageUID] = useState();
  const [errorMessage, setErrorMessage] = useState();

  const logout = useCallback(
    (errorMessage) => {
      ipcRenderer.invoke(IpcActions.LOGOUT);
      removeCredentials();
      setErrorMessage(errorMessage);
      setSelectedMessageUID(undefined);
    },
    [removeCredentials]
  );

  if (!credentials) {
    return (
      <Login
        setCredentials={setCredentials}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    );
  }

  return (
    <main>
      <BrowserRouter>
        <Switch>
          <Sidebar
            credentials={credentials}
            logout={logout}
            selectedMessageUID={selectedMessageUID}
            setSelectedMessageUID={setSelectedMessageUID}
          >
            <Route
              path="/message/:uid"
              component={(props) => (
                <Message credentials={credentials} logout={logout} {...props} />
              )}
            />
            <Route
              path="/send"
              component={(props) => (
                <Send
                  credentials={credentials}
                  setSelectedMessageUID={setSelectedMessageUID}
                  logout={logout}
                  {...props}
                />
              )}
            />
            <Route path="/logout">
              <Logout
                logout={logout}
                setSelectedMessageUID={setSelectedMessageUID}
              />
            </Route>
            <Route path="/">
              <Redirect to="/send" />
            </Route>
          </Sidebar>
        </Switch>
      </BrowserRouter>
    </main>
  );
}

export default App;
