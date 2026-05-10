"use server";

import { asc, desc, eq, getColumns, ne, sql } from "drizzle-orm";

import db from "@/db";
import { connectionLog, player, server } from "@/db/schema";
import { ConnectionLogRowInsert as TableRowInsert } from "@/db/types";
import { cacheDbRequest } from "@/lib/cache";
import { create } from "@/lib/dashboard/common/create";
import { updateAction } from "@/lib/dashboard/common/update";
import { DbTarget } from "@/lib/types";
import { formatHwidByteaHex, formatHwidHex } from "@/utils/hwid";
import log from "@/utils/stdlog";
import { isDev } from "@/utils/stdvar";

const target: DbTarget = "connectionLog";
const idColumn = connectionLog.connectionLogId;

type ConnectionLogMutationInput = TableRowInsert;
type PackedPlayerOption = {
    userName: string;
    userId: string;
    address: string;
    hwid: string;
};

/**
 * Normalizes hwid mutation value.
 */
function normalizeHwidMutationValue(value: unknown): string | null {
    const normalized = formatHwidByteaHex(value);
    return normalized || null;
}

/**
 * Resolves player user id by username.
 */
async function resolveUserIdByUsername(
    rawValue: string | null | undefined,
): Promise<string | null> {
    const username = rawValue?.trim();
    if (!username) return null;

    const [targetPlayer] = await db
        .select({ userId: player.userId })
        .from(player)
        .where(eq(player.lastSeenUserName, username))
        .limit(1)
        .execute();

    return targetPlayer?.userId ?? null;
}

/**
 * Resolves a connection server id from its display name.
 */
async function resolveServerIdByName(
    rawValue: string | number | null | undefined,
): Promise<number | null> {
    if (typeof rawValue === "number") return rawValue;

    const serverName = rawValue?.trim();
    if (!serverName) return null;

    const [targetServer] = await db
        .select({ serverId: server.serverId })
        .from(server)
        .where(eq(server.name, serverName))
        .limit(1)
        .execute();

    if (targetServer?.serverId != null) return targetServer.serverId;

    const numericServerId = Number(serverName);
    if (Number.isInteger(numericServerId)) return numericServerId;

    return null;
}

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
            userName,
            userId: row.userId,
            address: row.address?.trim() ?? "",
            hwid: formatHwidHex(row.hwid),
        });
    }

    return [...deduped.values()];
}

/**
 * Creates row action.
 */
export async function createRowAction(
    row: ConnectionLogMutationInput,
): Promise<void> {
    if (!row.userId) {
        const resolvedUserId = await resolveUserIdByUsername(row.userName);
        if (resolvedUserId) row.userId = resolvedUserId;
    }

    if (!row.userId) {
        if (isDev) {
            log.warn(
                `Dev mode: Player username "${row.userName}" not found, selecting random player`,
            );
            const [randomPlayer] = await db
                .select({
                    userId: player.userId,
                    lastSeenUserName: player.lastSeenUserName,
                })
                .from(player)
                .where(ne(player.lastSeenUserName, ""))
                .orderBy(sql`random()`)
                .limit(1)
                .execute();

            if (!randomPlayer?.userId || !randomPlayer.lastSeenUserName) {
                log.error(
                    "Create connection log aborted: no available username found",
                );
                throw new Error(
                    "No available username found for connection creation",
                );
            }

            row.userId = randomPlayer.userId;
            row.userName = randomPlayer.lastSeenUserName;
        } else {
            throw new Error("Invalid player username");
        }
    }

    const serverId = await resolveServerIdByName(row.serverId);
    if ((row.serverId ?? "") !== "" && serverId == null) {
        throw new Error("No matching server found for server name");
    }
    row.serverId = serverId ?? 0;
    row.hwid = normalizeHwidMutationValue(row.hwid);

    const result = await create(target, row);
    if (!result.ok)
        throw new Error(`Failed to create row in action: ${result.error}`);
}

/**
 * Updates row action.
 */
export async function updateRowAction(fd: FormData): Promise<void> {
    const userIdInput = `${fd.get("userId") ?? ""}`.trim();
    const userNameInput = `${fd.get("userName") ?? ""}`.trim();
    const userId =
        userIdInput || (await resolveUserIdByUsername(userNameInput));
    if (userId) {
        fd.set("userId", userId);
    } else {
        fd.delete("userId");
    }

    const serverInput = `${fd.get("serverId") ?? ""}`.trim();
    const serverId = await resolveServerIdByName(serverInput);
    if (serverInput && serverId == null) {
        throw new Error("No matching server found for server name");
    }
    fd.set("serverId", String(serverId ?? 0));

    fd.set("hwid", normalizeHwidMutationValue(fd.get("hwid")) ?? "");

    const result = await updateAction(target, idColumn, fd);
    if (!result.ok)
        throw new Error(`Failed to update row in action: ${result.error}`);
}
