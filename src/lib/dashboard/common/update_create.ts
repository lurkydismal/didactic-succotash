import { AnyColumn, eq } from "drizzle-orm";

import db from "@/db";
import { getSessionData } from "@/lib/auth";
import { updateDbCacheTags } from "@/lib/cache";
import { ActionResult, DbTarget, parseRawTarget } from "@/lib/types";
import log from "@/utils/stdlog";
import { mutationInputSchema } from "@/utils/validate/schemas";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

type MutationRow = Record<string, unknown>;

type SaveOptions = {
    isUpdate?: boolean;
    idColumn?: AnyColumn;
};

/**
 * Converts input into db mutation.
 */
function toDbMutation(
    parsedRow: MutationRow,
    actor: string,
    opts: SaveOptions,
): MutationRow {
    const base = { ...parsedRow };

    if (opts.isUpdate) {
        delete base.id;
        return {
            ...base,
            last_editor: actor,
        };
    }

    return {
        ...base,
        author: actor,
        last_editor: actor,
    };
}

/**
 * Saves the parsed row mutation to the database.
 */
export async function save(
    rawTarget: DbTarget,
    input: MutationRow,
    opts: SaveOptions = {},
): Promise<ActionResult> {
    try {
        const table = parseRawTarget(rawTarget);
        const parsedInput = await mutationInputSchema.parseAsync(input);

        const schema = opts.isUpdate
            ? createUpdateSchema(table)
            : createInsertSchema(table);
        const selectSchema = createSelectSchema(table);

        const sessionUser = await getSessionData();
        const actor = sessionUser?.username;

        if (!actor) {
            throw new Error("Missing authenticated user");
        }

        const row = await schema.parseAsync(
            toDbMutation(parsedInput, actor, opts),
        );

        if (opts.isUpdate) {
            if (parsedInput.id === undefined) {
                throw new Error("Missing id for update");
            }

            if (!opts.idColumn) {
                throw new Error("Missing id column for update");
            }

            const existingRows = await db
                .select()
                .from(table)
                .where(eq(opts.idColumn, parsedInput.id))
                .limit(1)
                .execute();

            await selectSchema.array().length(1).parseAsync(existingRows);

            await db
                .update(table)
                .set(row)
                .where(eq(opts.idColumn, parsedInput.id))
                .execute();
        } else {
            await db.insert(table).values(row).execute();
        }

        return { ok: true };
    } catch (err) {
        log.error(opts.isUpdate ? "Update error:" : "Create error:", err);
        return {
            ok: false,
            error: opts.isUpdate ? "Update error" : "Create error",
        };
    }

    // Runs only on success path; errors from updateTag propagate to the caller.
    updateDbCacheTags([rawTarget]);
    return { ok: true };
}

/**
 * Parses form.
 */
export function parseForm(formData: FormData): MutationRow {
    const entries = z
        .record(z.string(), z.unknown())
        .parse(Object.fromEntries(formData.entries())) as MutationRow;

    for (const [key, value] of Object.entries(entries)) {
        if (value === "") {
            entries[key] = null;
        }
    }

    if (entries.id !== undefined) {
        entries.id = z.coerce.number().int().positive().parse(entries.id);
    }

    return entries;
}
