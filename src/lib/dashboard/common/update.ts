"use server";

import { DbTarget } from "@/lib/types";
import { parseForm, save } from "@/lib/dashboard/common/update_create";
import { AnyColumn } from "drizzle-orm";

export async function updateAction(
    rawTarget: DbTarget,
    idColumn: AnyColumn,
    formData: FormData,
) {
    const input = parseForm(formData);
    return save(rawTarget, input, { isUpdate: true, idColumn });
}
