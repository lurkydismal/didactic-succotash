"use server";

import { DbTarget } from "@/lib/types";
import { getRowsAction as _getRowsAction } from "@/lib/dashboard/common/function";

const target: DbTarget = "player";

/**
 * Gets player rows for the read-only dashboard table.
 */
export async function getRowsAction(): ReturnType<typeof _getRowsAction> {
    return _getRowsAction(target, "playerId");
}
