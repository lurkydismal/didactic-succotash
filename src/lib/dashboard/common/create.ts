"use server";

import { TableRowInsert } from "@/db/types";
import { ActionResult, DbTarget } from "@/lib/types";
import { parseForm, save } from "@/lib/dashboard/common/update_create";

export async function create(
    rawTarget: DbTarget,
    row: TableRowInsert,
): Promise<ActionResult> {
    return save(rawTarget, row, { isUpdate: false });
}

export async function createAction(rawTarget: DbTarget, formData: FormData) {
    const input = parseForm(formData);
    return save(rawTarget, input, { isUpdate: false });
}
