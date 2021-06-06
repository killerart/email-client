/* eslint-disable @typescript-eslint/no-explicit-any */
import inbox from 'inbox-2';
import { ParsedMail, simpleParser } from 'mailparser';

interface ImapCredentials {
  email: string;
  password: string;
  imapServer: string;
}

interface MessageHeaders {
  UID: number;
  flags: string[];
  date: Date;
  title: string;
  from: {
    name: string;
    address: string;
  };
}

class ImapClient {
  private static instance?: ImapClient;

  private imap: any;

  private constructor() {
    this.imap = undefined;
  }

  public static getInstance() {
    ImapClient.instance = ImapClient.instance ?? new ImapClient();
    return ImapClient.instance;
  }

  public openConnection(
    credentials: ImapCredentials,
    onNewMessageCallback?: (message: MessageHeaders) => void
  ) {
    if (this.imap) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      this.imap = inbox.createConnection(false, credentials.imapServer, {
        secureConnection: true,
        auth: {
          user: credentials.email,
          pass: credentials.password,
        },
      });

      this.imap.once('connect', () => resolve());

      this.imap.on('error', (error: Error) => {
        this.closeConnection();
        reject(error);
      });

      this.imap.on('new', (message: MessageHeaders) => {
        onNewMessageCallback?.(message);
      });

      this.imap.connect();
    });
  }

  public closeConnection() {
    try {
      this.imap?.close();
    } catch (error) {
      console.error(error);
    } finally {
      this.imap = null;
    }
  }

  public listMessages(from: number, limit = 0, mailbox = 'INBOX') {
    if (!this.imap) return Promise.reject(Error('Connection is not opened'));

    return new Promise<MessageHeaders[]>((resolve, reject) => {
      this.imap.openMailbox(mailbox, (error: Error) => {
        if (error) reject(error);

        this.imap.listMessages(
          from,
          limit,
          (error: any, messages: MessageHeaders[]) => {
            if (error) reject(error);
            resolve(messages);
          }
        );
      });
    });
  }

  public getMessage(uid: number, mailbox = 'INBOX') {
    if (!this.imap) return Promise.reject(Error('Connection is not opened'));

    return new Promise<ParsedMail>((resolve, reject) => {
      this.imap.openMailbox(mailbox, (error: Error) => {
        if (error) reject(error);

        resolve(simpleParser(this.imap.createMessageStream(uid)));
      });
    });
  }

  public addSeenFlag(uid: number, mailbox = 'INBOX') {
    if (!this.imap) return Promise.reject(Error('Connection is not opened'));

    return new Promise<void>((resolve, reject) => {
      this.imap.openMailbox(mailbox, (error: Error) => {
        if (error) reject(error);

        this.imap.addFlags(uid, ['\\Seen'], (error: Error) => {
          if (error) reject(error);
          resolve();
        });
      });
    });
  }
}

export { ImapCredentials };
export default ImapClient;
