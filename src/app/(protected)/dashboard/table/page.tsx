"use client";

import TableDataGrid from "@/components/TableDataGrid";
import { TableRow, TableRowInsert } from "@/db/types";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import fields from "@/data/dashboard/table/fields";
import { makeCrudActions } from "@/lib/dashboard/common/actions";
import { table } from "@/db/schema";

export default function Page() {
    const { getRowsAction, createRowAction, updateRowAction } = makeCrudActions<
        TableRowInsert
    >("table", table.id);

    const emptyRow: TableRowInsert = {
        content: "-",
    };

    // Optional: custom change detector (compares trimmed content)
    const isRowChanged = (row: TableRow, values: Partial<TableRowInsert>) => {
        const a = String(row.content ?? "").trim();
        const b = String(values.content ?? "").trim();
        return a !== b;
    };

    return (
        <TableDataGrid<TableRow, TableRowInsert>
            createRowAction={createRowAction}
            emptyRow={emptyRow}
            fields={fields}
            getRowsAction={getRowsAction}
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
