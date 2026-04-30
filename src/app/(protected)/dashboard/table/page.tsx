"use client";

import TableDataGrid from "@/components/TableDataGrid";
import { TableRow, TableRowInsert } from "@/db/types";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import fields from "@/data/dashboard/table/fields";
import { makeCrudActions } from "@/lib/dashboard/common/actions";
import { table } from "@/db/schema";
import { DbTarget } from "@/lib/types";
import {
    getRowsAction,
    createRowAction,
    updateRowAction,
} from "@/lib/dashboard/common/function";

const target: DbTarget = "table";
const id = table.id;

export default function Page() {
    const _getRowsAction = async (): ReturnType<typeof getRowsAction> => {
        "use server";

        return getRowsAction(target, id);
    };
    const _createRowAction = async (
        row: TableRowInsert,
    ): ReturnType<typeof createRowAction> => {
        "use server";

        return createRowAction(target, row);
    };
    const _updateRowAction = async (
        fd: FormData,
    ): ReturnType<typeof updateRowAction> => {
        "use server";

        return updateRowAction(target, id, fd);
    };
    // const { getRowsAction, createRowAction, updateRowAction } = await makeCrudActions<
    //     TableRowInsert
    // >("table", table.id);

    const emptyRow: TableRowInsert = {
        content: "-",
    };

    return (
        <TableDataGrid<TableRow, TableRowInsert>
            createRowAction={_createRowAction}
            emptyRow={emptyRow}
            fields={fields}
            getRowsAction={_getRowsAction}
            updateRowAction={_updateRowAction}
            extraButtons={
                <ExtraToolbarButtons
                    emptyRow={emptyRow}
                    createRowAction={_createRowAction}
                />
            }
        />
    );
}
