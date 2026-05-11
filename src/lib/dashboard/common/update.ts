"use server";

import { DbTarget } from "@/lib/types";
import { parseForm, save } from "@/lib/dashboard/common/update_create";
import { AnyColumn } from "drizzle-orm";

export type UpdateIdColumn = {
    column: AnyColumn;
    valueKey: string;
};

/**
 * Updates action.
 */
export async function updateAction(
    rawTarget: DbTarget,
    idColumn: AnyColumn | UpdateIdColumn[],
    formData: FormData,
) {
    const input = parseForm(formData);
    const idOptions = Array.isArray(idColumn)
        ? { idColumns: idColumn }
        : { idColumn };

    return save(rawTarget, input, { isUpdate: true, ...idOptions });
}
