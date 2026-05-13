"use server";

import { asc, desc, eq, getColumns, ne, sql } from "drizzle-orm";

import db from "@/db";
import { connectionLog, player, server } from "@/db/schema";
import { cacheDbRequest } from "@/lib/cache";
import { formatHwidHex } from "@/utils/hwid";

const idColumn = connectionLog.connectionLogId;

type PackedPlayerOption = {
    userName: string;
    userId: string;
    address: string;
    hwid: string;
};

/**
 * Gets rows action.
 */
export async function getRowsAction() {
    "use cache";
    cacheDbRequest(["connectionLog", "player", "server"]);

    const connectionLogColumns = getColumns(connectionLog);
    const rows = await db
        .select({
            ...connectionLogColumns,
            id: connectionLog.connectionLogId,
            userId: connectionLog.userId,
            userName: sql<string>`COALESCE(${connectionLog.userName}, ${player.lastSeenUserName}, '')`,
            address: sql<string>`COALESCE(${connectionLog.address}, ${player.lastSeenAddress}, NULL)`,
            hwid: sql<string>`COALESCE(encode(${connectionLog.hwid}, 'hex'), encode(${player.lastSeenHwid}, 'hex'), '')`,
            serverId: server.name,
        })
        .from(connectionLog)
        .leftJoin(player, eq(connectionLog.userId, player.userId))
        .leftJoin(server, eq(connectionLog.serverId, server.serverId))
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
 * Gets server name options action.
 */
export async function getServerNameOptionsAction(): Promise<string[]> {
    "use cache";
    cacheDbRequest(["server"]);

    const rows = await db
        .select({ serverName: server.name })
        .from(server)
        .orderBy(asc(server.name))
        .execute();

    return [
        ...new Set(rows.map((row) => row.serverName.trim()).filter(Boolean)),
    ];
}

/**
 * Gets player address options action.
 */
export async function getPlayerAddressOptionsAction(): Promise<string[]> {
    "use cache";
    cacheDbRequest(["player"]);

    const rows = await db
        .select({ address: player.lastSeenAddress })
        .from(player)
        .where(sql`${player.lastSeenAddress} IS NOT NULL`)
        .orderBy(asc(player.lastSeenAddress))
        .execute();

    return [
        ...new Set(
            rows
                .map((row) => (row.address ? row.address.trim() : ""))
                .filter(Boolean),
        ),
    ];
}

/**
 * Gets player hwid options action.
 */
export async function getPlayerHwidOptionsAction(): Promise<string[]> {
    "use cache";
    cacheDbRequest(["player"]);

    const rows = await db
        .select({ hwid: player.lastSeenHwid })
        .from(player)
        .where(sql`${player.lastSeenHwid} IS NOT NULL`)
        .orderBy(asc(player.lastSeenHwid))
        .execute();

    return [
        ...new Set(rows.map((row) => formatHwidHex(row.hwid)).filter(Boolean)),
    ];
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
            address: player.lastSeenAddress,
            hwid: player.lastSeenHwid,
        })
        .from(player)
        .where(ne(player.lastSeenUserName, ""))
        .orderBy(asc(player.lastSeenUserName))
        .execute();

    const deduped = new Map<string, PackedPlayerOption>();
    for (const row of rows) {
        if (!row.userId || deduped.has(row.userId)) continue;

        deduped.set(row.userId, {
            userName: row.userName,
            userId: row.userId,
            address: row.address?.trim() ?? "",
            hwid: formatHwidHex(row.hwid),
        });
    }

    return [...deduped.values()];
}

/**
 * Handles has server id action behavior.
 */
export async function hasServerIdAction(serverName: string): Promise<boolean> {
    "use cache";
    cacheDbRequest(["server"]);

    if (!serverName) return false;

    const [existingServer] = await db
        .select({ serverId: server.serverId })
        .from(server)
        .where(eq(server.name, serverName))
        .limit(1)
        .execute();

    return !!existingServer;
}
