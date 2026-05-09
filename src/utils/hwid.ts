type BufferJson = {
    data: unknown[];
    type: "Buffer";
};

const HWID_HEX_RE = /^[0-9a-f]*$/i;
const isByte = (value: unknown): value is number =>
    Number.isInteger(value) && value >= 0 && value <= 255;

/**
 * Formats a byte as a two-character hexadecimal string.
 */
const byteToHex = (byte: number) => byte.toString(16).padStart(2, "0");

/**
 * Formats a byte array as a contiguous hexadecimal string.
 */
const bytesToHex = (bytes: ArrayLike<number>) =>
    Array.from(bytes, (byte) => byteToHex(byte & 0xff)).join("");

/**
 * Checks whether the value is an array buffer view.
 */
const isArrayBufferView = (value: unknown): value is ArrayBufferView =>
    ArrayBuffer.isView(value);

/**
 * Checks whether the value is a buffer json.
 */
const isBufferJson = (value: unknown): value is BufferJson => {
    if (!value || typeof value !== "object") return false;

    const maybeBufferJson = value as BufferJson;
    return (
        maybeBufferJson.type === "Buffer" && Array.isArray(maybeBufferJson.data)
    );
};

/**
 * Formats hwid hex.
 */
export function formatHwidHex(value: unknown): string {
    if (value === null || value === undefined) return "";

    if (typeof value === "string") {
        const normalized =
            value.startsWith("\\x") || value.startsWith("\\X")
                ? value.slice(2)
                : value;
        return normalized.toLowerCase();
    }

    if (value instanceof ArrayBuffer) {
        return bytesToHex(new Uint8Array(value));
    }

    if (isArrayBufferView(value)) {
        return bytesToHex(
            new Uint8Array(value.buffer, value.byteOffset, value.byteLength),
        );
    }

    if (Array.isArray(value)) {
        if (!value.every(isByte)) {
            throw new TypeError("HWID arrays must contain bytes");
        }
        return bytesToHex(value);
    }

    if (isBufferJson(value)) {
        if (!value.data.every(isByte)) {
            throw new TypeError("Buffer JSON must contain bytes");
        }
        return bytesToHex(value.data);
    }

    return String(value);
}

/**
 * Formats hwid bytea hex.
 */
export function formatHwidByteaHex(value: unknown): string {
    const hex = formatHwidHex(value).trim().replace(/^\\x/i, "");
    if (hex && !HWID_HEX_RE.test(hex)) {
        throw new TypeError("HWID must be valid hexadecimal");
    }
    return hex ? `\\x${hex}` : "";
}
