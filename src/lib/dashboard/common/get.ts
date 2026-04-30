"use server";

import db from "@/db";
import log from "@/utils/stdlog";
import { AnyColumn, desc } from "drizzle-orm";
import { DbTarget, parseRawTarget } from "@/lib/types";
import { ActionResult } from "@/lib/types";
import { GridValidRowModel } from "@mui/x-data-grid";
import { toCamelCase } from "@/utils/stdfunc";

// TODO: Validate what returns
export async function getRows(
    rawTarget: DbTarget,
    id: AnyColumn,
): Promise<ActionResult<readonly GridValidRowModel[]>> {
    try {
        const table = parseRawTarget(rawTarget);

        const rows = await db.select().from(table).orderBy(desc(id)).execute();

        // If no rows, just return early
        if (rows.length === 0) {
            return { ok: true, data: rows };
        }

        // Check if "id" already exists
        const hasId = "id" in rows[0];

        log.trace({ id, hasId, rows });

        const result = hasId
            ? rows
            : rows.map((row: any) => ({
                ...row,
                id: row[toCamelCase(id.name)], // pull value from provided column
            }));

        log.trace({ result });

        return {
            ok: true,
            data: result,
        };
    } catch (err) {
        // err is a ZodError on validation failure or other error
        log.error("Get error:", err);

        return { ok: false, error: "Get error" };
    }
}
