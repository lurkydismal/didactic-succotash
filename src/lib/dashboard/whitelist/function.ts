"use server";

import { asc, desc, eq, getColumns, ne, sql } from "drizzle-orm";

import db from "@/db";
import { player, whitelist } from "@/db/schema";
import { cacheDbRequest } from "@/lib/cache";

const idColumn = whitelist.userId;

type PackedPlayerOption = {
    userName: string;
    userId: string;
};

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
