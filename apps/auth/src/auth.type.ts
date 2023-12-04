export type MessageType = {
  message: string;
};
export type SignTokenType = {
  sub: string;
  email: string;
  secret: string | Buffer;
  expiresIn: string | number;
};
