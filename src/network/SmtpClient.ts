/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer, { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

export interface SmtpCredentials {
  email: string;
  password: string;
  smtpServer: string;
  smtpPort: number;
}

export default class SmtpClient {
  private smtp?: Transporter;

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
