"use server";

import { adminLog, round, server } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AdminLogRowInsert as TableRowInsert } from "@/db/types";
import { DbTarget } from "@/lib/types";
import {
    createRowAction as _createRowAction,
    getRowsAction as _getRowsAction,
    updateRowAction as _updateRowAction,
} from "@/lib/dashboard/common/function";
import { cacheDbRequest } from "@/lib/cache";
import db from "@/db";

const target: DbTarget = "adminLog";
const id = adminLog.adminLogId;

export async function getRowsAction(): ReturnType<typeof _getRowsAction> {
    return _getRowsAction(target, "adminLogId");
}

export async function createRowAction(
    row: TableRowInsert,
): ReturnType<typeof _createRowAction> {
    return _createRowAction(target, row);
}

export async function updateRowAction(
    fd: FormData,
): ReturnType<typeof _updateRowAction> {
    return _updateRowAction(target, id, fd);
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

/**
 * Gets the server name attached to an existing round.
 */
export async function getServerNameByRoundIdAction(
    roundId: number,
): Promise<string | null> {
    "use cache";
    cacheDbRequest(["round", "server"]);

    if (!Number.isInteger(roundId)) return null;

    const [existingRound] = await db
        .select({ serverName: server.name })
        .from(round)
        .innerJoin(server, eq(round.serverId, server.serverId))
        .where(eq(round.roundId, roundId))
        .limit(1)
        .execute();

    return existingRound?.serverName ?? null;
}
