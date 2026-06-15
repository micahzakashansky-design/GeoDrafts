import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  customFetch,
  setBaseUrl,
  setAuthTokenGetter,
  ApiError,
  ResponseParseError
} from "../custom-fetch";

describe("customFetch", () => {
  beforeEach(() => {
    // Reset any state
    setBaseUrl("");
    setAuthTokenGetter(null);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should make a basic GET request", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    const result = await customFetch("https://api.example.com/test");

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/test", expect.objectContaining({ method: "GET" }));
    expect(result).toEqual({ data: "test" });
  });

  it("should append base URL to relative paths", async () => {
    setBaseUrl("https://api.base.com/v1");

    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await customFetch("/users");

    expect(fetch).toHaveBeenCalledWith("https://api.base.com/v1/users", expect.any(Object));
  });

  it("should not append base URL to absolute URLs", async () => {
    setBaseUrl("https://api.base.com/v1");

    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await customFetch("https://external.example.com/data");

    expect(fetch).toHaveBeenCalledWith("https://external.example.com/data", expect.any(Object));
  });

  it("should use explicit method when provided", async () => {
    const mockResponse = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await customFetch("/submit", { method: "POST", body: JSON.stringify({ a: 1 }) });

    expect(fetch).toHaveBeenCalledWith("/submit", expect.objectContaining({ method: "POST" }));
  });

  it("should throw TypeError when GET request has a body", async () => {
    await expect(customFetch("/test", { body: "data" })).rejects.toThrow(TypeError);
    await expect(customFetch("/test", { method: "HEAD", body: "data" })).rejects.toThrow(TypeError);
  });

  it("should attach auth token from getter", async () => {
    setAuthTokenGetter(async () => "test-token");

    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await customFetch("/secure");

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const headers = fetchCall[1]?.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer test-token");
  });

  it("should merge custom headers and apply defaults for json", async () => {
    const mockResponse = new Response(JSON.stringify({ data: "test" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await customFetch("/test", {
      responseType: "json",
      headers: { "X-Custom": "value" },
      body: JSON.stringify({ a: 1 }),
      method: "POST"
    });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const headers = fetchCall[1]?.headers as Headers;

    expect(headers.get("x-custom")).toBe("value");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("accept")).toBe("application/json, application/problem+json");
  });

  it("should throw ApiError for non-ok responses", async () => {
    const mockResponse = new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      statusText: "Not Found",
      headers: { "Content-Type": "application/json" },
    });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    let error: ApiError | undefined;
    try {
      await customFetch("/test");
    } catch (e) {
      error = e as ApiError;
    }

    expect(error).toBeInstanceOf(ApiError);
    expect(error?.status).toBe(404);
    expect(error?.message).toContain("HTTP 404 Not Found: Not Found");
  });

  it("should throw ResponseParseError when JSON parsing fails", async () => {
    const mockResponse = new Response("{ invalid json ", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    let error: ResponseParseError | undefined;
    try {
      await customFetch("/test", { responseType: "json" });
    } catch (e) {
      error = e as ResponseParseError;
    }

    expect(error).toBeInstanceOf(ResponseParseError);
    expect(error?.rawBody).toBe("{ invalid json ");
  });
});
