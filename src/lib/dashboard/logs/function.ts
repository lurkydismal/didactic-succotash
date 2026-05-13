"use server";

import { adminLog, round, server } from "@/db/schema";
import { desc, eq, getColumns } from "drizzle-orm";
import { cacheDbRequest } from "@/lib/cache";
import db from "@/db";

/**
 * Gets log rows with the related server name needed by the dashboard table.
 */
export async function getRowsAction() {
    "use cache";
    cacheDbRequest(["adminLog", "round", "server"]);

    const adminLogColumns = getColumns(adminLog);
    const rows = await db
        .select({
            ...adminLogColumns,
            serverName: server.name,
        })
        .from(adminLog)
        .innerJoin(round, eq(adminLog.roundId, round.roundId))
        .innerJoin(server, eq(round.serverId, server.serverId))
        .orderBy(desc(adminLog.adminLogId))
        .execute();

    return rows.map((row) => ({
        ...row,
        id: row.adminLogId,
    }));
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
