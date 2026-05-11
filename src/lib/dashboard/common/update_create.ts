"use server";

import db from "@/db";
import { getSessionData } from "@/lib/auth";
import { cacheDbRequest, updateDbCacheTags } from "@/lib/cache";
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

import { AnyColumn, and, eq } from "drizzle-orm";
import { UpdateIdColumn } from "@/lib/dashboard/common/update";

type UpdateId = UpdateIdColumn;

type SaveOptions = {
    isUpdate?: boolean;
    idColumn?: AnyColumn;
    idColumns?: UpdateId[];
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
 * Builds the update identifier list used for existence checks and update filters.
 */
function getUpdateIds(opts: SaveOptions): UpdateId[] {
    if (opts.idColumns?.length) return opts.idColumns;

    if (opts.idColumn) {
        return [{ column: opts.idColumn, valueKey: "id" }];
    }

    return [];
}

/**
 * Resolves update identifier values from the parsed mutation input.
 */
function getUpdateIdValues(
    input: MutationRow,
    ids: UpdateId[],
): { column: AnyColumn; value: unknown }[] {
    return ids.map(({ column, valueKey }) => {
        const value = input[valueKey];

        if (value === undefined) {
            throw new Error(`Missing ${valueKey} for update`);
        }

        return { column, value };
    });
}

/**
 * Builds the database WHERE clause that targets one update row.
 */
function getUpdateWhere(idValues: { column: AnyColumn; value: unknown }[]) {
    const filters = idValues.map(({ column, value }) => eq(column, value));
    const where = and(...filters);

    if (!where) {
        throw new Error("Missing id columns for update");
    }

    return where;
}

/**
 * Fetches the current database row for an update so callers can validate it still exists.
 */
async function getExistingRows(
    rawTarget: DbTarget,
    idValues: { column: AnyColumn; value: unknown }[],
): Promise<MutationRow[]> {
    "use cache";
    cacheDbRequest([rawTarget]);

    const table = parseRawTarget(rawTarget);

    return db
        .select()
        .from(table)
        .where(getUpdateWhere(idValues))
        .limit(1)
        .execute();
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
            const updateIds = getUpdateIds(opts);
            const updateIdValues = getUpdateIdValues(parsedInput, updateIds);
            const updateWhere = getUpdateWhere(updateIdValues);

            const existingRows = await getExistingRows(
                rawTarget,
                updateIdValues,
            );

            await selectSchema.array().length(1).parseAsync(existingRows);

            const updateResult = await db
                .update(table)
                .set(row)
                .where(updateWhere)
                .execute();

            // Ensure mutation actually affected one row.
            const affectedRows =
                typeof (updateResult as { rowCount?: number }).rowCount ===
                    "number"
                    ? (updateResult as { rowCount: number }).rowCount
                    : Array.isArray(updateResult)
                        ? updateResult.length
                        : undefined;

            if (affectedRows === undefined) {
                throw new Error(
                    "Unable to verify update: database driver did not return affected row count",
                );
            } else if (affectedRows !== 1) {
                throw new Error("Update target no longer exists");
            }
        } else {
            await db.insert(table).values(row).execute();
        }

        // Runs only after a successful mutation so cached DB reads do not stay stale.
        try {
            updateDbCacheTags([rawTarget]);
        } catch (cacheErr) {
            log.error("Cache revalidation error:", cacheErr);
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

/**
 * Parses form.
 */
export async function parseForm(formData: FormData): Promise<MutationRow> {
    const entries = z
        .record(z.string(), z.unknown())
        .parse(Object.fromEntries(formData.entries())) as MutationRow;

    for (const [key, value] of Object.entries(entries)) {
        if (value === "") {
            entries[key] = null;
        }
    }

    if (entries.id !== undefined) {
        const idResult = z.coerce
            .number()
            .int()
            .positive()
            .safeParse(entries.id);
        if (!idResult.success) {
            throw new Error(`Invalid id value: ${entries.id}`);
        }
        entries.id = idResult.data;
    }

    return entries;
}
