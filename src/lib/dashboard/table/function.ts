"use server";

import { TableRow, TableRowInsert } from "@/db/types";
import { makeCrudActions } from "@/lib/dashboard/common/actions";
import { TABLE_CRUD_CONFIG } from "@/lib/dashboard/common/config";

export const { _getRowsAction, createRowAction, updateRowAction } =
    makeCrudActions<TableRow, TableRowInsert>(TABLE_CRUD_CONFIG);
