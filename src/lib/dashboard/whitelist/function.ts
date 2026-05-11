"use server";

import { asc, desc, eq, getColumns, ne, sql } from "drizzle-orm";

import db from "@/db";
import { player, whitelist } from "@/db/schema";
import { WhitelistRowInsert as TableRowInsert } from "@/db/types";
import { cacheDbRequest, updateDbCacheTags } from "@/lib/cache";
import { create } from "@/lib/dashboard/common/create";
import { DbTarget } from "@/lib/types";
import log from "@/utils/stdlog";
import { isDev } from "@/utils/stdvar";

const target: DbTarget = "whitelist";
const idColumn = whitelist.userId;

type WhitelistMutationInput = TableRowInsert & { userName?: unknown };
type PackedPlayerOption = {
    userName: string;
    userId: string;
};
type PackedAutocompleteValue = {
    label?: unknown;
    packedValues?: Record<string, unknown>;
};

/**
 * Normalizes a possibly packed autocomplete value into a player user id string.
 */
function normalizePlayerUserId(rawValue: unknown): string | null {
    if (typeof rawValue === "string") {
        const value = rawValue.trim();
        return value || null;
    }

    if (rawValue && typeof rawValue === "object") {
        const option = rawValue as PackedAutocompleteValue;
        const packedUserId = option.packedValues?.userId;
        if (typeof packedUserId === "string") {
            const value = packedUserId.trim();
            if (value) return value;
        }

        if (typeof option.label === "string") {
            const value = option.label.trim();
            return value || null;
        }
    }

    return null;
}

/**
 * Resolves a whitelist mutation input into a persisted player user id.
 */
async function resolveWhitelistUserId(
    row: WhitelistMutationInput,
): Promise<string | null> {
    const userId = normalizePlayerUserId(row.userId);
    if (!userId) return null;

    const [targetPlayer] = await db
        .select({ userId: player.userId })
        .from(player)
        .where(eq(player.userId, userId))
        .limit(1)
        .execute();

    return targetPlayer?.userId ?? null;
}

/**
 * Selects a random player id for development-only whitelist creation fallback.
 */
async function getRandomPlayerUserId(): Promise<string> {
    const [randomPlayer] = await db
        .select({ userId: player.userId })
        .from(player)
        .where(ne(player.lastSeenUserName, ""))
        .orderBy(sql`random()`)
        .limit(1)
        .execute();

    if (!randomPlayer?.userId) {
        log.error("Create whitelist aborted: no available player found");
        throw new Error("No available player found for whitelist creation");
    }

    return randomPlayer.userId;
}

/**
 * Converts submitted form data into the old and new user ids needed for whitelist updates.
 */
function parseWhitelistUpdateForm(fd: FormData): {
    currentUserId: string;
    nextUserId: string;
} {
    const currentUserId = normalizePlayerUserId(fd.get("id"));
    const nextUserId = normalizePlayerUserId(fd.get("userId"));

    if (!currentUserId) {
        throw new Error("Missing whitelist row id");
    }

    if (!nextUserId) {
        throw new Error("Invalid player user ID");
    }

    return { currentUserId, nextUserId };
}

/**
 * Gets rows action.
 */
export async function getRowsAction() {
    "use cache";
    cacheDbRequest(["whitelist", "player"]);

    const whitelistColumns = getColumns(whitelist);
    const rows = await db
        .select({
            ...whitelistColumns,
            id: whitelist.userId,
            userId: whitelist.userId,
            userName: sql<string>`COALESCE(${player.lastSeenUserName}, '')`,
        })
        .from(whitelist)
        .leftJoin(player, eq(whitelist.userId, player.userId))
        .orderBy(desc(idColumn))
        .execute();

    return rows;
}

/**
 * Gets player username options action.
 */
export async function getUsernameOptionsAction(): Promise<string[]> {
    "use cache";
    cacheDbRequest(["player"]);

    const rows = await db
        .select({ userName: player.lastSeenUserName })
        .from(player)
        .where(ne(player.lastSeenUserName, ""))
        .orderBy(asc(player.lastSeenUserName))
        .execute();

    return [...new Set(rows.map((row) => row.userName.trim()).filter(Boolean))];
}

/**
 * Gets player packed options action.
 */
export async function getPlayerPackedOptionsAction(): Promise<
    PackedPlayerOption[]
> {
    "use cache";
    cacheDbRequest(["player"]);

    const rows = await db
        .select({
            userName: player.lastSeenUserName,
            userId: player.userId,
        })
        .from(player)
        .where(ne(player.lastSeenUserName, ""))
        .orderBy(asc(player.lastSeenUserName))
        .execute();

    const deduped = new Map<string, PackedPlayerOption>();
    for (const row of rows) {
        const userName = row.userName.trim();
        if (!row.userId || !userName || deduped.has(row.userId)) continue;

        deduped.set(row.userId, {
            userName,
            userId: row.userId,
        });
    }

    return [...deduped.values()];
}

/**
 * Creates row action.
 */
export async function createRowAction(
    row: WhitelistMutationInput,
): Promise<void> {
    let userId = await resolveWhitelistUserId(row);

    if (!userId) {
        if (isDev) {
            log.warn(
                `Dev mode: Player user id "${normalizePlayerUserId(row.userId) ?? ""}" not found, selecting random player`,
            );
            userId = await getRandomPlayerUserId();
        } else {
            throw new Error("Invalid player user ID");
        }
    }

    const result = await create(target, { userId });
    if (!result.ok)
        throw new Error(`Failed to create row in action: ${result.error}`);
}

/**
 * Updates row action.
 */
export async function updateRowAction(fd: FormData): Promise<void> {
    const { currentUserId, nextUserId } = parseWhitelistUpdateForm(fd);

    const resolvedNextUserId = await resolveWhitelistUserId({
        userId: nextUserId,
    });
    if (!resolvedNextUserId) {
        throw new Error("Invalid player user ID");
    }

    const updateResult = await db
        .update(whitelist)
        .set({ userId: resolvedNextUserId })
        .where(eq(idColumn, currentUserId))
        .execute();

    const affectedRows =
        typeof (updateResult as { rowCount?: number }).rowCount === "number"
            ? (updateResult as { rowCount: number }).rowCount
            : Array.isArray(updateResult)
              ? updateResult.length
              : undefined;

    if (affectedRows === undefined) {
        throw new Error(
            "Unable to verify update: database driver did not return affected row count",
        );
    }

    if (affectedRows !== 1) {
        throw new Error("Update target no longer exists");
    }

    updateDbCacheTags([target]);
}
