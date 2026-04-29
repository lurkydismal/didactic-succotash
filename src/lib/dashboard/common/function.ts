"use server";

import { TableRowInsert } from "@/db/types";
import { create } from "@/lib/dashboard/common/create";
import { getRows } from "@/lib/dashboard/common/get";
import { update } from "@/lib/dashboard/common/update";
import { DbTarget } from "@/lib/types";
import { AnyColumn } from "drizzle-orm";

const table: DbTarget = "table";

export const getRowsAction = async (id: AnyColumn) => {
    const result = await getRows(table, id);

    if (result.ok) {
        return result.data;
    } else {
        const message = `Failed to get rows in action: ${result.error}`;
        throw new Error(message);
    }
};

export const createRowAction = async (row: TableRowInsert) => {
    const result = await create(table, row);

    if (!result.ok) {
        const message = `Failed to create row in action: ${result.error}`;
        throw new Error(message);
    }
};

export const updateRowAction = async (row: TableRowInsert) => {
    const result = await update(table, row);

    if (!result.ok) {
        const message = `Failed to update row in action: ${result.error}`;
        throw new Error(message);
    }

    return result.ok;
};
