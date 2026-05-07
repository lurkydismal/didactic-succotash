"use server";

import db from "@/db";
import log from "@/utils/stdlog";
import { AnyColumn, desc } from "drizzle-orm";
import { DbTarget, parseRawTarget } from "@/lib/types";
import { ActionResult } from "@/lib/types";
import { GridValidRowModel } from "@mui/x-data-grid";
import { toCamelCase } from "@/utils/stdfunc";
import { createSelectSchema } from "drizzle-zod";

// TODO: Validate what returns
/**
 * Gets rows.
 */
export async function getRows(
    rawTarget: DbTarget,
    id: AnyColumn,
): Promise<ActionResult<readonly GridValidRowModel[]>> {
    try {
        const table = parseRawTarget(rawTarget);

        const rows = await db.select().from(table).orderBy(desc(id)).execute();
        const rowSchema = createSelectSchema(table).array();
        const validRows = await rowSchema.parseAsync(rows);

        // If no rows, just return early
        if (validRows.length === 0) {
            return { ok: true, data: validRows };
        }

        // Check if "id" already exists
        const hasId = "id" in validRows[0];

        log.trace({ id, hasId, rows });

        type Row = (typeof validRows)[number];

        const result = hasId
            ? validRows
            : validRows.map((row: Row) => ({
                  ...row,
                  id: row[toCamelCase(id.name) as keyof Row], // pull value from provided column
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
