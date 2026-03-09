export interface KwtSmsConfig {
  username: string;
  password: string;
  senderId?: string;
  testMode?: boolean;
}

export interface SendRequest {
  mobile: string;
  message: string;
  senderId?: string;
  test?: boolean;
}

export interface SendResponse {
  "msg-id": string;
  numbers: number;
  "points-charged": number;
  "balance-after": number;
  "unix-timestamp": number;
}

export interface BalanceResponse {
  available: number;
  purchased: number;
}

export interface SenderIdResponse {
  senderid: string[];
}

export interface ValidateResponse {
  mobile: {
    OK: string[];
    ER: string[];
    NR: string[];
  };
}

export interface StatusResponse {
  status: string;
  description: string;
}

export interface CoverageResponse {
  coverage: Array<{
    prefix: string;
    country: string;
    rate: number;
  }>;
}

export interface KwtSmsError {
  code: string;
  description: string;
  action: string;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: KwtSmsError };
