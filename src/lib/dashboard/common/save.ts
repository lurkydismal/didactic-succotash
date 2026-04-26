import db from "@/db";
import { serverBan, table } from "@/db/schema";
import { getSessionData } from "@/lib/auth";
import { ActionResult } from "@/lib/types";
import log from "@/utils/stdlog";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { CrudConfig } from "./config";

const tableInputSchema = z.object({
    id: z.coerce.number().int().positive().optional(),
    content: z.string().trim().min(1),
});

const banInputSchema = z.object({
    serverBanId: z.coerce.number().int().positive().optional(),
    address: z.string().trim().min(1),
    reason: z.string().default(""),
    banTime: z.coerce.date().optional(),
});

function buildFormPayload(formData: FormData) {
    return Object.fromEntries(formData.entries());
}

export async function saveFromFormData(
    config: CrudConfig,
    formData: FormData,
    opts: { isUpdate?: boolean } = {},
): Promise<ActionResult> {
    try {
        const sessionUser = await getSessionData();
        const actor = sessionUser?.username;

        if (!actor) {
            throw new Error("Missing authenticated user");
        }

        const payload = buildFormPayload(formData);

        if (config.target === "table") {
            const parsed = tableInputSchema.parse(payload);

            if (opts.isUpdate) {
                if (!parsed.id) throw new Error("Missing id for update");

                await db
                    .update(table)
                    .set({ content: parsed.content, last_editor: actor })
                    .where(eq(table.id, parsed.id))
                    .execute();
            } else {
                await db
                    .insert(table)
                    .values({ content: parsed.content, author: actor, last_editor: actor })
                    .execute();
            }

            return { ok: true };
        }

        if (config.target === "serverBan") {
            const parsed = banInputSchema.parse(payload);

            if (opts.isUpdate) {
                if (!parsed.serverBanId) throw new Error("Missing serverBanId for update");

                await db
                    .update(serverBan)
                    .set({
                        address: parsed.address,
                        reason: parsed.reason,
                        banTime: parsed.banTime ?? new Date(),
                        lastEditedAt: new Date(),
                    })
                    .where(eq(serverBan.serverBanId, parsed.serverBanId))
                    .execute();
            } else {
                await db
                    .insert(serverBan)
                    .values({
                        address: parsed.address,
                        reason: parsed.reason,
                        banTime: parsed.banTime ?? new Date(),
                    })
                    .execute();
            }

            return { ok: true };
        }

        throw new Error(`Unsupported target ${config.target}`);
    } catch (err) {
        log.error(opts.isUpdate ? "Update error:" : "Create error:", err);
        return {
            ok: false,
            error: opts.isUpdate ? "Update error" : "Create error",
        };
    }
}
