type BufferJson = {
    data: unknown[];
    type: "Buffer";
};

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
        return bytesToHex(value.map(Number));
    }

    if (isBufferJson(value)) {
        return bytesToHex(value.data.map(Number));
    }

    return String(value);
}

/**
 * Formats hwid bytea hex.
 */
export function formatHwidByteaHex(value: unknown): string {
    const hex = formatHwidHex(value).trim().replace(/^\\x/i, "");
    return hex ? `\\x${hex}` : "";
}
