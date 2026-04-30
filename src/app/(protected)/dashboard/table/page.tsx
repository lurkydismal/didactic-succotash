"use client";

import TableDataGrid from "@/components/TableDataGrid";
import { TableRow, TableRowInsert } from "@/db/types";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import fields from "@/data/dashboard/table/fields";
import { createRowAction, getRowsAction, updateRowAction } from "@/lib/dashboard/table/function";

export default function Page() {
    const emptyRow: TableRowInsert = {
        content: "-",
    };

    return (
        <TableDataGrid<TableRow, TableRowInsert>
            createRowAction={createRowAction}
            emptyRow={emptyRow}
            fields={fields}
            getRowsAction={getRowsAction}
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
