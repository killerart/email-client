import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import Logout from '../components/Logout';
import Message from '../components/Message';
import Send from '../components/Send';
import Sidebar from '../components/Sidebar';
import IAppStrategy from './IAppStrategy';

class LoggedInStrategy implements IAppStrategy {
  public render({
    credentials,
    logout,
    selectedMessageUID,
    setSelectedMessageUID,
  }: any) {
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
                component={(props: any) => (
                  <Message
                    credentials={credentials}
                    logout={logout}
                    {...props}
                  />
                )}
              />
              <Route
                path="/send"
                component={(props: any) => (
                  <Send
                    credentials={credentials}
                    setSelectedMessageUID={setSelectedMessageUID}
                    logout={logout}
                    {...props}
                  />
                )}
              />
              <Route path="/logout">
                <Logout logout={logout} />
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
}

export default LoggedInStrategy;
