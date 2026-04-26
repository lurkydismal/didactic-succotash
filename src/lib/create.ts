"use server";

import { ActionResult, DbTarget } from "@/lib/types";
import { getCrudConfigByTarget } from "@/lib/dashboard/common/config";
import { saveFromFormData } from "@/lib/dashboard/common/save";

export async function createAction(formData: FormData): Promise<ActionResult> {
    const rawTarget = formData.get("target") as DbTarget;
    const config = getCrudConfigByTarget(rawTarget);

    return saveFromFormData(config, formData, { isUpdate: false });
}
