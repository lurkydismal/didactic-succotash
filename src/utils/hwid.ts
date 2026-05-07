type BufferJson = {
    data: unknown[];
    type: "Buffer";
};

const byteToHex = (byte: number) => byte.toString(16).padStart(2, "0");

const bytesToHex = (bytes: ArrayLike<number>) =>
    Array.from(bytes, (byte) => byteToHex(byte & 0xff)).join("");

const isArrayBufferView = (value: unknown): value is ArrayBufferView =>
    ArrayBuffer.isView(value);

const isBufferJson = (value: unknown): value is BufferJson => {
    if (!value || typeof value !== "object") return false;

    const maybeBufferJson = value as BufferJson;
    return (
        maybeBufferJson.type === "Buffer" && Array.isArray(maybeBufferJson.data)
    );
};

export function formatHwidHex(value: unknown): string {
    if (value === null || value === undefined) return "";

    if (typeof value === "string") {
        return value.startsWith("\\x") ? value.slice(2).toLowerCase() : value;
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
