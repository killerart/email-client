import { ImapCredentials } from './ImapClient';
import { SmtpCredentials } from './SmtpClient';

type Credentials = ImapCredentials & SmtpCredentials;

enum IpcActions {
  GET_ALL_MESSAGES = 'GET_ALL_MESSAGES',
  GET_MESSAGE = 'GET_MESSAGE',
  NEW_MESSAGE = 'NEW_MESSAGE',
  LOGOUT = 'LOGOUT',
  SEND_MESSAGE = 'SEND_MESSAGE',
}

export { Credentials, IpcActions };
