"use server";

import { create } from "@/lib/dashboard/common/create";
import { getRows } from "@/lib/dashboard/common/get";
import { updateAction } from "@/lib/dashboard/common/update";
import { DbTarget } from "@/lib/types";
import { AnyColumn } from "drizzle-orm";

export async function getRowsAction(target: DbTarget, id: AnyColumn) {
    const result = await getRows(target, id);

    if (result.ok) {
        return result.data!;
    } else {
        const message = `Failed to get rows in action: ${result.error}`;
        throw new Error(message);
    }
}

export async function createRowAction<RI extends Record<string, unknown>>(
    target: DbTarget,
    row: RI,
) {
    const result = await create(target, row);

    if (!result.ok) {
        const message = `Failed to create row in action: ${result.error}`;
        throw new Error(message);
    }
}

export async function updateRowAction(
    target: DbTarget,
    id: AnyColumn,
    fd: FormData,
) {
    const result = await updateAction(target, id, fd);

    if (!result.ok) {
        const message = `Failed to update row in action: ${result.error}`;
        throw new Error(message);
    }
}
