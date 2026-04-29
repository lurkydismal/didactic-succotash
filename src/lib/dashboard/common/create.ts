"use server";

import { ActionResult, DbTarget } from "@/lib/types";
import { parseForm, save } from "@/lib/dashboard/common/update_create";
import { InferInsertModel, Table } from "drizzle-orm";

export async function create<TTable extends Table>(
    rawTarget: DbTarget,
    row: InferInsertModel<TTable>,
): Promise<ActionResult> {
    return save(rawTarget, row, { isUpdate: false });
}

export async function createAction(rawTarget: DbTarget, formData: FormData) {
    const input = parseForm(formData);
    return save(rawTarget, input, { isUpdate: false });
}
