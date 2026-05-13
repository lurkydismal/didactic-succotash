"use server";

import { getRows } from "@/lib/dashboard/common/get";
import { DbTarget } from "@/lib/types";

/**
 * Gets rows action.
 */
export async function getRowsAction(target: DbTarget, idColumnName: string) {
    const result = await getRows(target, idColumnName);

    if (result.ok) {
        if (!result.data) {
            throw new Error("getRows returned ok but no data");
        }
        return result.data;
    } else {
        const message = `Failed to get rows in action: ${result.error}`;
        throw new Error(message);
    }
}
