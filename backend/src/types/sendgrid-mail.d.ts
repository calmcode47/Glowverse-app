declare module '@sendgrid/mail' {
  export interface MailDataRequired {
    to: string | string[];
    from: string | { email: string; name?: string };
    subject?: string;
    text?: string;
    html?: string;
  }

  const sgMail: {
    setApiKey: (key: string) => void;
    send: (msg: MailDataRequired) => Promise<Array<{ statusCode: number; headers?: Record<string, string> }>>;
  };

  export default sgMail;
}
