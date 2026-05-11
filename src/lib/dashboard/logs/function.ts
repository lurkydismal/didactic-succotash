"use server";

import { adminLog, round, server } from "@/db/schema";
import { desc, eq, getColumns } from "drizzle-orm";
import { AdminLogRowInsert as TableRowInsert } from "@/db/types";
import { DbTarget } from "@/lib/types";
import { cacheDbRequest } from "@/lib/cache";
import db from "@/db";
import { parseForm, save } from "@/lib/dashboard/common/update_create";

const target: DbTarget = "adminLog";
const id = [
    { column: adminLog.roundId, valueKey: "roundId" },
    { column: adminLog.adminLogId, valueKey: "id" },
];

/**
 * Parses the logs JSON field from editable text into the jsonb value expected by the database.
 */
function parseLogJsonValue(value: unknown): unknown {
    if (typeof value !== "string") return value;

    try {
        return JSON.parse(value);
    } catch {
        throw new Error("JSON must be valid");
    }
}

/**
 * Returns a copy of a log mutation row with its JSON field converted from text.
 */
function normalizeLogJsonRow<TRow extends Record<string, unknown>>(
    row: TRow,
): TRow {
    if (!("json" in row)) return row;

    return {
        ...row,
        json: parseLogJsonValue(row.json),
    };
}

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

export async function createRowAction(row: TableRowInsert): Promise<void> {
    const result = await save(target, normalizeLogJsonRow(row), {
        isUpdate: false,
    });

    if (!result.ok) {
        const message = `Failed to create row in action: ${result.error}`;
        throw new Error(message);
    }
}

export async function updateRowAction(fd: FormData): Promise<void> {
    const input = normalizeLogJsonRow(await parseForm(fd));
    const result = await save(target, input, {
        isUpdate: true,
        idColumns: id,
    });

    if (!result.ok) {
        const message = `Failed to update row in action: ${result.error}`;
        throw new Error(message);
    }
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
