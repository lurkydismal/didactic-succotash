"use server";

import { asc, desc, eq, getColumns, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import db from "@/db";
import { player, round, serverRoleBan } from "@/db/schema";
import { cacheDbRequest } from "@/lib/cache";
import { formatHwidHex } from "@/utils/hwid";

const idColumn = serverRoleBan.serverRoleBanId;

/**
 * Gets rows action.
 */
export async function getRowsAction() {
    "use cache";
    cacheDbRequest(["serverRoleBan", "player"]);

    const serverRoleBanColumns = getColumns(serverRoleBan);
    const banningAdminPlayer = alias(player, "banning_admin_player");
    const rows = await db
        .select({
            ...serverRoleBanColumns,
            id: serverRoleBan.serverRoleBanId,
            playerUsername: player.lastSeenUserName,
            address: sql<string>`COALESCE(${serverRoleBan.address}, ${player.lastSeenAddress}, NULL)`,
            hwid: sql<string>`COALESCE(encode(${serverRoleBan.hwid}, 'hex'), encode(${player.lastSeenHwid}, 'hex'), '')`,
            banningAdmin: banningAdminPlayer.lastSeenUserName,
        })
        .from(serverRoleBan)
        .leftJoin(player, eq(serverRoleBan.playerUserId, player.userId))
        .leftJoin(
            banningAdminPlayer,
            eq(serverRoleBan.banningAdmin, banningAdminPlayer.userId),
        )
        .orderBy(desc(idColumn))
        .execute();

    return rows;
}

/**
 * Gets player username options action.
 */
export async function getPlayerUsernameOptionsAction(): Promise<string[]> {
    "use cache";
    cacheDbRequest(["player"]);

    const rows = await db
        .select({ playerUsername: player.lastSeenUserName })
        .from(player)
        .where(ne(player.lastSeenUserName, ""))
        .orderBy(asc(player.lastSeenUserName))
        .execute();

    return [
        ...new Set(
            rows.map((row) => row.playerUsername.trim()).filter(Boolean),
        ),
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
    { playerUsername: string; address: string; hwid: string }[]
> {
    "use cache";
    cacheDbRequest(["player"]);

    const rows = await db
        .select({
            playerUsername: player.lastSeenUserName,
            address: player.lastSeenAddress,
            hwid: player.lastSeenHwid,
        })
        .from(player)
        .where(ne(player.lastSeenUserName, ""))
        .orderBy(asc(player.lastSeenUserName))
        .execute();

    const deduped = new Map<
        string,
        { playerUsername: string; address: string; hwid: string }
    >();
    for (const row of rows) {
        const label = row.playerUsername.trim();
        if (!label || deduped.has(label)) continue;

        deduped.set(label, {
            playerUsername: label,
            address: row.address?.trim() ?? "",
            hwid: formatHwidHex(row.hwid),
        });
    }

    return [...deduped.values()];
}

/**
 * Handles has round id action behavior.
 */
export async function hasRoundIdAction(roundId: number): Promise<boolean> {
    "use cache";
    cacheDbRequest(["round"]);

    if (!Number.isInteger(roundId)) return false;

    const [existingRound] = await db
        .select({ roundId: round.roundId })
        .from(round)
        .where(eq(round.roundId, roundId))
        .limit(1)
        .execute();

    return !!existingRound;
}
