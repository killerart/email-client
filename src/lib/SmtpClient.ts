/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer, { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

interface SmtpCredentials {
  email: string;
  password: string;
  smtpServer: string;
  smtpPort: number;
}

class SmtpClient {
  private static instance?: SmtpClient;

  private smtp?: Transporter;

  private constructor() {
    this.smtp = undefined;
  }

  public static getInstance(): SmtpClient {
    SmtpClient.instance = SmtpClient.instance ?? new SmtpClient();
    return SmtpClient.instance;
  }

  public openConnection(credentials: SmtpCredentials) {
    if (this.smtp) return;

    this.smtp = nodemailer.createTransport({
      host: credentials.smtpServer,
      port: credentials.smtpPort ?? undefined,
      auth: {
        user: credentials.email,
        pass: credentials.password,
      },
    });
  }

  public closeConnection() {
    try {
      this.smtp?.close();
    } catch (error) {
      console.error(error);
    } finally {
      this.smtp = undefined;
    }
  }

  public sendMail(mailOptions: Mail.Options) {
    if (!this.smtp)
      return Promise.reject(Error('SMTP connection is not established'));
    return this.smtp.sendMail(mailOptions);
  }
}

export { SmtpCredentials };
export default SmtpClient;
