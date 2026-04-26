"use client";

import TableDataGrid from "@/components/TableDataGrid";
import { ServerBanRow as TableRow, ServerBanRowInsert as TableRowInsert } from "@/db/types";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import {
    _getRowsAction,
    createRowAction,
    updateRowAction,
} from "@/lib/table/function";
import fields from "@/data/dashboard/bans/fields";

export default function Page() {
    const emptyRow: TableRowInsert = {
        address: "-",
        banTime: new Date(),
        reason: ""
    };

    // Optional: custom change detector (compares trimmed content)
    const isRowChanged = (row: TableRow, values: Partial<TableRowInsert>) => {
        const a = String(row.address ?? "").trim();
        const b = String(values.address ?? "").trim();
        return a !== b;
    };

    return (
        <TableDataGrid<TableRow, TableRowInsert>
            createRowAction={createRowAction}
            emptyRow={emptyRow}
            fields={fields}
            getRowsAction={_getRowsAction}
            isRowChanged={isRowChanged}
            updateRowAction={updateRowAction}
            extraButtons={
                <ExtraToolbarButtons
                    emptyRow={emptyRow}
                    createRowAction={createRowAction}
                />
            }
        />
    );
}
