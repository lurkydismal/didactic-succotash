"use server";

import { create } from "@/lib/dashboard/common/create";
import { getRows } from "@/lib/dashboard/common/get";
import { update } from "@/lib/dashboard/common/update";
import { DbTarget } from "@/lib/types";
import { AnyColumn } from "drizzle-orm";

export const getRowsAction = async (target: DbTarget, id: AnyColumn) => {
    const result = await getRows(target, id);

    if (result.ok) {
        return result.data;
    } else {
        const message = `Failed to get rows in action: ${result.error}`;
        throw new Error(message);
    }
};

export const createRowAction = async (target: DbTarget, row: any) => {
    const result = await create(target, row);

    if (!result.ok) {
        const message = `Failed to create row in action: ${result.error}`;
        throw new Error(message);
    }
};

export const updateRowAction = async (target: DbTarget, row: any) => {
    const result = await update(target, row);

    if (!result.ok) {
        const message = `Failed to update row in action: ${result.error}`;
        throw new Error(message);
    }

    return result.ok;
};
