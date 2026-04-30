"use server";

import { TableRowInsert } from "@/db/types";
import {
    getRowsAction as _getRowsAction,
    createRowAction as _createRowAction,
    updateRowAction as _updateRowAction,
} from "@/lib/dashboard/common/function";
import { table } from "@/db/schema";
import { DbTarget } from "@/lib/types";

const target: DbTarget = "table";
const id = table.id;

export async function getRowsAction(): ReturnType<typeof _getRowsAction> {
    return _getRowsAction(target, id);
}

export async function createRowAction(
    row: TableRowInsert,
): ReturnType<typeof _createRowAction> {
    return _createRowAction(target, row);
}

export async function updateRowAction(
    fd: FormData,
): ReturnType<typeof _updateRowAction> {
    return _updateRowAction(target, id, fd);
}