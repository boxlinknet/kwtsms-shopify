import type {
  KwtSmsConfig,
  SendResponse,
  BalanceResponse,
  SenderIdResponse,
  ValidateResponse,
  CoverageResponse,
  Result,
} from "./types";
import { mapError } from "./errors";
import { normalize } from "./phone";
import { cleanMessage } from "./message";

const API_BASE = "https://www.kwtsms.com/API";
const TIMEOUT_MS = 10_000;

export class KwtSmsClient {
  private username: string;
  private password: string;
  private senderId: string;
  private testMode: boolean;

  constructor(config: KwtSmsConfig) {
    this.username = config.username;
    this.password = config.password;
    this.senderId = config.senderId ?? "KWT-SMS";
    this.testMode = config.testMode ?? true;
  }

  async send(
    mobile: string,
    message: string,
    options?: { senderId?: string; test?: boolean },
  ): Promise<Result<SendResponse>> {
    // Normalize phone number
    const phoneResult = normalize(mobile);
    if (!phoneResult.valid) {
      return {
        ok: false,
        error: {
          code: "PHONE_INVALID",
          description: phoneResult.error ?? "Invalid phone number",
          action: "Check phone number format",
        },
      };
    }

    // Clean message text
    const cleanedMessage = cleanMessage(message);
    if (cleanedMessage.length === 0) {
      return {
        ok: false,
        error: {
          code: "MSG_EMPTY",
          description: "Message is empty after cleaning",
          action: "Provide message content",
        },
      };
    }

    const testFlag = options?.test ?? this.testMode;

    return this._post<SendResponse>("/send/", {
      sender: options?.senderId ?? this.senderId,
      mobile: phoneResult.normalized,
      message: cleanedMessage,
      test: testFlag ? "1" : "0",
    });
  }

  async sendBatch(
    mobiles: string[],
    message: string,
    options?: { senderId?: string; test?: boolean },
  ): Promise<Result<SendResponse>> {
    // Normalize all phone numbers
    const normalized: string[] = [];
    for (const mobile of mobiles) {
      const result = normalize(mobile);
      if (result.valid) {
        normalized.push(result.normalized);
      }
    }

    if (normalized.length === 0) {
      return {
        ok: false,
        error: {
          code: "PHONE_INVALID",
          description: "No valid phone numbers provided",
          action: "Check phone number formats",
        },
      };
    }

    if (normalized.length > 200) {
      return {
        ok: false,
        error: {
          code: "ERR007",
          description: "More than 200 numbers",
          action: "Split into batches of 200 or fewer",
        },
      };
    }

    const cleanedMessage = cleanMessage(message);
    if (cleanedMessage.length === 0) {
      return {
        ok: false,
        error: {
          code: "MSG_EMPTY",
          description: "Message is empty after cleaning",
          action: "Provide message content",
        },
      };
    }

    const testFlag = options?.test ?? this.testMode;

    return this._post<SendResponse>("/send/", {
      sender: options?.senderId ?? this.senderId,
      mobile: normalized.join(","),
      message: cleanedMessage,
      test: testFlag ? "1" : "0",
    });
  }

  async balance(): Promise<Result<BalanceResponse>> {
    return this._post<BalanceResponse>("/balance/", {});
  }

  async senderIds(): Promise<Result<SenderIdResponse>> {
    return this._post<SenderIdResponse>("/senderid/", {});
  }

  async validate(mobile: string): Promise<Result<ValidateResponse>> {
    const phoneResult = normalize(mobile);
    return this._post<ValidateResponse>("/validate/", {
      mobile: phoneResult.valid ? phoneResult.normalized : mobile,
    });
  }

  async coverage(): Promise<Result<CoverageResponse>> {
    return this._post<CoverageResponse>("/coverage/", {});
  }

  private async _post<T>(endpoint: string, body: Record<string, unknown>): Promise<Result<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
          ...body,
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (data.result === "OK") {
        return { ok: true, data: data as T };
      }

      if (data.result === "ERROR" && data.code) {
        return { ok: false, error: mapError(data.code) };
      }

      return {
        ok: false,
        error: {
          code: "UNKNOWN",
          description: data.description ?? "Unknown API response",
          action: "Check API response format",
        },
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return {
          ok: false,
          error: {
            code: "TIMEOUT",
            description: "API request timed out after 10 seconds",
            action: "Check network connectivity and retry",
          },
        };
      }

      return {
        ok: false,
        error: {
          code: "NETWORK",
          description: err instanceof Error ? err.message : "Network error",
          action: "Check network connectivity",
        },
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
