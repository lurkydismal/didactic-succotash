"use server";

/**
 * Server-only mock action helper.
 *
 * Provides a single overloaded async function used to simulate server work
 * with a configurable delay and predictable return shapes.
 *
 * Supported behaviors:
 * - Delay only → returns `{ ok: true }`
 * - Delay + value → returns `{ ok: true, data }`
 * - Delay + value + field name → returns `{ ok: true, [fieldName]: value }`
 *
 * Intended for testing, prototyping, and UI development where real backend
 * logic is not yet available but timing and response structure matter.
 */

import { delay } from "@/utils/stdfunc";
import { ActionResult } from "@/lib/types";
import log from "@/utils/stdlog";

/**
 * Mock server action that only waits for the specified duration
 * and returns a simple success response.
 *
 * @param milliseconds - How long to delay before resolving.
 * @returns An object indicating successful completion.
 *
 * @example
 * const result = await mockAction(200);
 * // { ok: true }
 */
export async function mockAction(milliseconds: number): Promise<{ ok: true }>;

/**
 * Mock server action that waits for the specified duration
 * and returns a success response with a `data` field.
 *
 * @typeParam T - Type of the data payload.
 * @param milliseconds - How long to delay before resolving.
 * @param data - Value to include in the response under `data`.
 * @returns An object with `{ ok: true, data }`.
 *
 * @example
 * const result = await mockAction(100, { id: 7 });
 * // { ok: true, data: { id: 7 } }
 */
export async function mockAction<T>(
    milliseconds: number,
    data: T,
): Promise<{ ok: true; data: T }>;

/**
 * Mock server action that waits for the specified duration
 * and returns a success response with a dynamically named field.
 *
 * @typeParam T - Type of the data payload.
 * @typeParam K - String literal type used as the response field name.
 * @param milliseconds - How long to delay before resolving.
 * @param data - Value to include in the response.
 * @param fieldName - Name of the field under which `data` is returned.
 * @returns An object with `{ ok: true }` plus `{ [fieldName]: data }`.
 */
export async function mockAction<T, K extends string>(
    milliseconds: number,
    data: T,
    fieldName: K,
): Promise<{ ok: true } & Record<K, T>>;

/**
 * Implementation of the overloaded `mockAction`.
 *
 * Behavior:
 * - Always waits for the specified delay.
 * - If no `data` is provided, returns `{ ok: true }`.
 * - If `fieldName` is provided, returns `{ ok: true, [fieldName]: data }`.
 * - Otherwise, returns `{ ok: true, data }`.
 *
 * This function is intended for testing, prototyping, or mocking
 * server actions with predictable timing and response shapes.
 */
export async function mockAction<T>(
    milliseconds: number,
    data?: T,
): Promise<ActionResult<T>> {
    log.trace("mockAction called", {
        milliseconds,
        hasData: data !== undefined,
    });
    log.debug("mockAction validating delay");
    log.info("mockAction execution started");
    log.warn("mockAction verbose warning-level probe");
    log.error("mockAction error-level probe log");
    const rawDelayMs = Number(milliseconds);
    if (!Number.isFinite(rawDelayMs) || rawDelayMs < 0) {
        log.error("mockAction invalid delay detected", { milliseconds });
        throw new Error(`Invalid delay value: ${milliseconds}`);
    }

    const MAX_DELAY_MS = 60_000; // 1 minute
    const safeDelayMs = Math.min(Math.floor(rawDelayMs), MAX_DELAY_MS);

    // Simulate async work
    await delay(safeDelayMs);
    log.debug("mockAction delay complete", { safeDelayMs });
    log.info("mockAction returning success payload");

    // Default payload case
    return {
        ok: true,
        data,
    };
}
