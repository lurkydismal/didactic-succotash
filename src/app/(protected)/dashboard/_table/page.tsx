"use client";

import TableDataGrid from "@/components/TableDataGrid";
import { TableRow, TableRowInsert } from "@/db/types";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import fields from "@/data/dashboard/_table/fields";
import {
    createRowAction,
    getRowsAction,
    updateRowAction,
} from "@/lib/dashboard/_table/function";

export default function Page() {
    return (
        <TableDataGrid<TableRow, TableRowInsert>
            createRowAction={createRowAction}
            fields={fields}
            getRowsAction={getRowsAction}
            updateRowAction={updateRowAction}
            extraButtons={
                <ExtraToolbarButtons createRowAction={createRowAction} />
            }
        />
    );
}
