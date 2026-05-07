import { describe, expect, it } from "vitest";

import { formatHwidByteaHex, formatHwidHex } from "./hwid";

describe("formatHwidHex", () => {
    it("formats binary-like HWID values as hex", () => {
        expect(formatHwidHex(new Uint8Array([0, 15, 16, 255]))).toBe(
            "000f10ff",
        );
        expect(formatHwidHex({ data: [171, 205], type: "Buffer" })).toBe(
            "abcd",
        );
    });

    it("keeps existing hex labels compatible with autocomplete", () => {
        expect(formatHwidHex("abcdef")).toBe("abcdef");
        expect(formatHwidHex("ABCDEF")).toBe("abcdef");
        expect(formatHwidHex("\\xABCDEF")).toBe("abcdef");
        expect(formatHwidHex(null)).toBe("");
        expect(formatHwidHex(undefined)).toBe("");
    });

    it("formats HWID values for bytea writes", () => {
        expect(formatHwidByteaHex("abcdef")).toBe("\\xabcdef");
        expect(formatHwidByteaHex("ABCDEF")).toBe("abcdef");
        expect(formatHwidByteaHex("\\xABCDEF")).toBe("\\xabcdef");
        expect(formatHwidByteaHex(" \\xABCDEF ")).toBe("\\xabcdef");
        expect(formatHwidByteaHex(new Uint8Array([0, 15, 16, 255]))).toBe(
            "\\x000f10ff",
        );
        expect(formatHwidByteaHex(null)).toBe("");
        expect(formatHwidByteaHex(undefined)).toBe("");
    });
});
