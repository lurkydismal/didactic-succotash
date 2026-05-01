/*
"use server";

import {
    ServerBanRowInsert as TableRowInsert,
} from "@/db/types";
import {
    getRowsAction as _getRowsAction,
    createRowAction as _createRowAction,
    updateRowAction as _updateRowAction,
} from "@/lib/dashboard/common/function";
import { DbTarget } from "@/lib/types";
import { serverBan } from "@/db/schema";

const target: DbTarget = "serverBan";
const id = serverBan.serverBanId;

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
*/
