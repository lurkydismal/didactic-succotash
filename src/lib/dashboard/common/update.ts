"use server";

import { DbTarget } from "@/lib/types";
import { parseForm, save } from "@/lib/dashboard/common/update_create";

export async function updateAction(rawTarget: DbTarget, formData: FormData) {
    const input = parseForm(formData);
    return save(rawTarget, input, { isUpdate: true });
}
