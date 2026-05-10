"use server";

import { asc, desc, eq, getColumns, ne, sql } from "drizzle-orm";

import db from "@/db";
import { whitelist, player, server } from "@/db/schema";
import { WhitelistRowInsert as TableRowInsert } from "@/db/types";
import { cacheDbRequest } from "@/lib/cache";
import { create } from "@/lib/dashboard/common/create";
import { updateAction } from "@/lib/dashboard/common/update";
import { DbTarget } from "@/lib/types";
import log from "@/utils/stdlog";
import { isDev } from "@/utils/stdvar";

const target: DbTarget = "whitelist";
const idColumn = whitelist.userId;

type WhitelistMutationInput = TableRowInsert & { userName?: string };
type PackedPlayerOption = {
    userName: string;
    userId: string;
};

/**
 * Resolves player user id by username.
 */
async function resolvePlayerUsernameById(
    rawValue: string | null | undefined,
): Promise<string | null> {
    const userId = rawValue?.trim();
    if (!userId) return null;

    const [targetPlayer] = await db
        .select({ userName: player.lastSeenUserName })
        .from(player)
        .where(eq(player.userId, userId))
        .limit(1)
        .execute();

    return targetPlayer?.userName ?? null;
}

/**
 * Gets rows action.
 */
export async function getRowsAction() {
    "use cache";
    cacheDbRequest(["whitelist", "player", "server"]);

    const whitelistColumns = getColumns(whitelist);
    const rows = await db
        .select({
            ...whitelistColumns,
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
        if (!row.userId || deduped.has(row.userId)) continue;

        deduped.set(row.userId, {
            userName: row.userName,
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
    row.userName = await resolvePlayerUsernameById(row.userId);
    if (!row.userName) {
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
                    "Create whitelist aborted: no available username found",
                );
                throw new Error(
                    "No available username found for whitelist creation",
                );
            }

            row.userId = randomPlayer.userId;
            row.userName = randomPlayer.lastSeenUserName;
        } else {
            throw new Error("Invalid player username");
        }
    }

    const result = await create(target, row);
    if (!result.ok)
        throw new Error(`Failed to create row in action: ${result.error}`);
}

/**
 * Updates row action.
 */
export async function updateRowAction(fd: FormData): Promise<void> {
    const userId = `${fd.get("userId") ?? ""}`.trim();
    if (!userId) {
        throw new Error("Invalid player username");
    }
    fd.set("userId", userId);

    const result = await updateAction(target, idColumn, fd);
    if (!result.ok)
        throw new Error(`Failed to update row in action: ${result.error}`);
}
