import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useOnlineStatus } from "./use-online-status";

describe("useOnlineStatus", () => {
  it("should return initial online status", () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(typeof result.current).toBe("boolean");
  });

  it("should update status when online and offline events fire", () => {
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(true);
  });
});
