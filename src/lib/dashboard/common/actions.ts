"use server";

import { DbTarget } from "@/lib/types";
import {
    getRowsAction,
    createRowAction,
    updateRowAction,
} from "@/lib/dashboard/common/function";
import { AnyColumn } from "drizzle-orm";

export function makeCrudActions<RI extends Record<string, unknown>>(
    target: DbTarget,
    id: AnyColumn,
) {
    return {
        getRowsAction: async (): ReturnType<typeof getRowsAction> => {
            "use server";

            return getRowsAction(target, id);
        },
        createRowAction: async (
            row: RI,
        ): ReturnType<typeof createRowAction> => {
            "use server";

            return createRowAction(target, row);
        },
        updateRowAction: async (
            fd: FormData,
        ): ReturnType<typeof updateRowAction> => {
            "use server";

            return updateRowAction(target, id, fd);
        },
    };
}
