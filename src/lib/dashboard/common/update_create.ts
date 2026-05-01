import db from "@/db";
import { getSessionData } from "@/lib/auth";
import { ActionResult, DbTarget, parseRawTarget } from "@/lib/types";
import { mutationInputSchema } from "@/utils/validate/schemas";
import log from "@/utils/stdlog";
import { AnyColumn, eq } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

type MutationRow = Record<string, unknown>;

type SaveOptions = {
    isUpdate?: boolean;
    idColumn?: AnyColumn;
};

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

export async function save(
    rawTarget: DbTarget,
    input: MutationRow,
    opts: SaveOptions = {},
): Promise<ActionResult> {
    try {
        const table = parseRawTarget(rawTarget);
        log.debug({ input });
        const parsedInput = await mutationInputSchema.parseAsync(input);

        const schema = opts.isUpdate
            ? createUpdateSchema(table)
            : createInsertSchema(table);

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
}

export function parseForm(formData: FormData): MutationRow {
    const entries = Object.fromEntries(formData.entries()) as MutationRow;

    if (entries.id !== undefined) {
        const parsedId = Number(entries.id);
        if (!Number.isNaN(parsedId)) {
            entries.id = parsedId;
        }
    }

    return entries;
}
