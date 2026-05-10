"use server";

import { player, connectionLog } from "@/db/schema";
import { asc, desc, eq, getColumns, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import db from "@/db";
import { ConnectionLogRowInsert as TableRowInsert } from "@/db/types";
import { DbTarget } from "@/lib/types";
import {
    createRowAction as _createRowAction,
    getRowsAction as _getRowsAction,
    updateRowAction as _updateRowAction,
} from "@/lib/dashboard/common/function";
import { formatHwidByteaHex, formatHwidHex } from "@/utils/hwid";
import { cacheDbRequest } from "@/lib/cache";
import { updateAction } from "@/lib/dashboard/common/update";
import { create } from "@/lib/dashboard/common/create";
import log from "@/utils/stdlog";
import { isDev } from "@/utils/stdvar";

const target: DbTarget = "connectionLog";
const idColumn = connectionLog.connectionLogId;

type ServerBanMutationInput = TableRowInsert;

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
    rawValue: string | undefined,
): Promise<string> {
    const username = rawValue?.trim();
    if (!username) throw new Error("TODO: WRITE");

    const [targetPlayer] = await db
        .select({ userId: player.userId })
        .from(player)
        .where(eq(player.lastSeenUserName, username))
        .limit(1)
        .execute();

    return targetPlayer.userId;
}

/**
 * Gets rows action.
 */
export async function getRowsAction() {
    "use cache";
    cacheDbRequest(["connectionLog", "player"]);

    const serverBanColumns = getColumns(connectionLog);
    const banningAdminPlayer = alias(player, "banning_admin_player");
    const rows = await db
        .select({
            ...serverBanColumns,
            id: connectionLog.connectionLogId,
            userName: player.lastSeenUserName,
            address: sql<string>`COALESCE(${connectionLog.address}, ${player.lastSeenAddress}, NULL)`,
            hwid: sql<string>`COALESCE(encode(${connectionLog.hwid}, 'hex'), encode(${player.lastSeenHwid}, 'hex'), '')`,
            banningAdmin: banningAdminPlayer.lastSeenUserName,
        })
        .from(connectionLog)
        .leftJoin(player, eq(connectionLog.userId, player.userId))
        .leftJoin(
            banningAdminPlayer,
            eq(connectionLog.banningAdmin, banningAdminPlayer.userId),
        )
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
    { userName: string; address: string; hwid: string }[]
> {
    "use cache";
    cacheDbRequest(["player"]);

    const rows = await db
        .select({
            userName: player.lastSeenUserName,
            address: player.lastSeenAddress,
            hwid: player.lastSeenHwid,
        })
        .from(player)
        .where(ne(player.lastSeenUserName, ""))
        .orderBy(asc(player.lastSeenUserName))
        .execute();

    const deduped = new Map<
        string,
        { userName: string; address: string; hwid: string }
    >();
    for (const row of rows) {
        const label = row.userName.trim();
        if (!label || deduped.has(label)) continue;

        deduped.set(label, {
            userName: label,
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
    row: ServerBanMutationInput,
): Promise<void> {
    row.userId = await resolveUserIdByUsername(row.userName);
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
                    "Create server ban aborted: no available username found",
                );
                throw new Error("No available username found for ban creation");
            }

            row.userId = randomPlayer.userId;
        } else {
            throw new Error("Invalid player username");
        }
    }

    const banningAdminUserId = await resolveUserIdByUsername(row.serverId);
    if ((row.serverId ?? 0) && !banningAdminUserId) {
        throw new Error("No matching player found for banning admin username");
    }
    row.serverId = banningAdminUserId;
    row.hwid = normalizeHwidMutationValue(row.hwid);

    // ! FIX: Maybe remove
    // delete row.userName;

    const result = await create(target, row);
    if (!result.ok)
        throw new Error(`Failed to create row in action: ${result.error}`);
}

/**
 * Updates row action.
 */
export async function updateRowAction(fd: FormData): Promise<void> {
    const userId = await resolveUserIdByUsername(`${fd.get("userName") ?? ""}`);
    if (userId != null) {
        fd.set("userId", userId);
    } else {
        fd.delete("userId");
    }

    const banningAdminInput = `${fd.get("banningAdmin") ?? ""}`.trim();
    const banningAdminUserId = await resolveUserIdByUsername(banningAdminInput);
    if (banningAdminInput && !banningAdminUserId) {
        throw new Error("No matching player found for banning admin username");
    }
    fd.set("banningAdmin", String(banningAdminUserId ?? 0));

    fd.set("hwid", normalizeHwidMutationValue(fd.get("hwid")) ?? "");

    fd.delete("userName");

    const result = await updateAction(target, idColumn, fd);
    if (!result.ok)
        throw new Error(`Failed to update row in action: ${result.error}`);
}
