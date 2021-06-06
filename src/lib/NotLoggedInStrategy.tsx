import React from 'react';
import Login from '../components/Login';
import IAppStrategy from './IAppStrategy';

class NotLoggedInStrategy implements IAppStrategy {
  public render({ setCredentials, errorMessage, setErrorMessage }: any) {
    return (
      <Login
        setCredentials={setCredentials}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    );
  }
}

export default NotLoggedInStrategy;
