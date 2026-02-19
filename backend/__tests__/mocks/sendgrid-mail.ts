export interface MailDataRequired {
  to: string | string[];
  from: string;
  subject?: string;
  text?: string;
  html?: string;
}

const sendgridMock = {
  setApiKey: (_key: string) => {
    void _key;
  },
  send: async (_msg: MailDataRequired) => {
    void _msg;
    return [{ statusCode: 202, headers: { "x-message-id": "test-message-id" } }];
  }
};

export default sendgridMock;
