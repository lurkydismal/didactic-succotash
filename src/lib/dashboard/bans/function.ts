"use server";

import { asc, desc, eq, getColumns, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import db from "@/db";
import { player, round, serverBan } from "@/db/schema";
import { ServerBanRowInsert as TableRowInsert } from "@/db/types";
import { cacheDbRequest } from "@/lib/cache";
import { create } from "@/lib/dashboard/common/create";
import { updateAction } from "@/lib/dashboard/common/update";
import { DbTarget } from "@/lib/types";
import { formatHwidByteaHex, formatHwidHex } from "@/utils/hwid";
import log from "@/utils/stdlog";
import { isDev } from "@/utils/stdvar";

const target: DbTarget = "serverBan";
const idColumn = serverBan.serverBanId;

type ServerBanMutationInput = TableRowInsert & { playerUsername?: string };

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
async function resolvePlayerUserIdByUsername(
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
 * Gets rows action.
 */
export async function getRowsAction() {
    "use cache";
    cacheDbRequest(["serverBan", "player"]);

    const serverBanColumns = getColumns(serverBan);
    const banningAdminPlayer = alias(player, "banning_admin_player");
    const rows = await db
        .select({
            ...serverBanColumns,
            id: serverBan.serverBanId,
            playerUsername: player.lastSeenUserName,
            address: sql<string>`COALESCE(${serverBan.address}, ${player.lastSeenAddress}, NULL)`,
            hwid: sql<string>`COALESCE(encode(${serverBan.hwid}, 'hex'), encode(${player.lastSeenHwid}, 'hex'), '')`,
            banningAdmin: banningAdminPlayer.lastSeenUserName,
        })
        .from(serverBan)
        .leftJoin(player, eq(serverBan.playerUserId, player.userId))
        .leftJoin(
            banningAdminPlayer,
            eq(serverBan.banningAdmin, banningAdminPlayer.userId),
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
 * Creates row action.
 */
export async function createRowAction(
    row: ServerBanMutationInput,
): Promise<void> {
    row.playerUserId = await resolvePlayerUserIdByUsername(row.playerUsername);
    if (!row.playerUserId) {
        if (isDev) {
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

            row.playerUserId = randomPlayer.userId;
        } else {
            throw Error("Invalid player username");
        }
    }

    const banningAdminUserId = await resolvePlayerUserIdByUsername(
        row.banningAdmin,
    );
    if ((row.banningAdmin ?? "").trim() && !banningAdminUserId) {
        throw new Error("No matching player found for banning admin username");
    }
    row.banningAdmin = banningAdminUserId;
    row.hwid = normalizeHwidMutationValue(row.hwid);

    delete row.playerUsername;
    const result = await create(target, row);
    if (!result.ok)
        throw new Error(`Failed to create row in action: ${result.error}`);
}

/**
 * Updates row action.
 */
export async function updateRowAction(fd: FormData): Promise<void> {
    const playerUserId = await resolvePlayerUserIdByUsername(
        `${fd.get("playerUsername") ?? ""}`,
    );
    fd.set("playerUserId", playerUserId ?? "");

    const banningAdminInput = `${fd.get("banningAdmin") ?? ""}`.trim();
    const banningAdminUserId =
        await resolvePlayerUserIdByUsername(banningAdminInput);
    if (banningAdminInput && !banningAdminUserId) {
        throw new Error("No matching player found for banning admin username");
    }
    fd.set("banningAdmin", banningAdminUserId ?? "");

    fd.set("hwid", normalizeHwidMutationValue(fd.get("hwid")) ?? "");

    fd.delete("playerUsername");

    const result = await updateAction(target, idColumn, fd);
    if (!result.ok)
        throw new Error(`Failed to update row in action: ${result.error}`);
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
