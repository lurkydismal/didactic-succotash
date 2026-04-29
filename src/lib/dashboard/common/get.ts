"use server";

import db from "@/db";
import log from "@/utils/stdlog";
import { AnyColumn, desc } from "drizzle-orm";
import { DbTarget, parseRawTarget } from "@/lib/types";
import { ActionResult } from "@/lib/types";

// TODO: Validate what returns
export async function getRows(rawTarget: DbTarget, id: AnyColumn): Promise<ActionResult> {
    try {
        const table = parseRawTarget(rawTarget);

        return {
            ok: true,
            data: await db
                .select()
                .from(table)
                .orderBy(desc(id))
                .execute(),
        };
    } catch (err) {
        // err is a ZodError on validation failure or other error
        log.error("Get error:", err);

        return { ok: false, error: "Get error" };
    }
}
