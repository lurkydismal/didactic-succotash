"use server";

import db from "@/db";
import { serverBan, table } from "@/db/schema";
import { ActionResult } from "@/lib/types";
import log from "@/utils/stdlog";
import { desc } from "drizzle-orm";
import { CrudConfig } from "./config";

export async function getRows(config: CrudConfig): Promise<ActionResult<unknown[]>> {
    try {
        if (config.target === "table") {
            const data = await db.select().from(table).orderBy(desc(table.id)).execute();
            return { ok: true, data };
        }

        if (config.target === "serverBan") {
            const data = await db
                .select()
                .from(serverBan)
                .orderBy(desc(serverBan.serverBanId))
                .execute();
            return { ok: true, data };
        }

        throw new Error(`Unsupported target ${config.target}`);
    } catch (err) {
        log.error("Get error:", err);
        return { ok: false, error: "Get error" };
    }
}
