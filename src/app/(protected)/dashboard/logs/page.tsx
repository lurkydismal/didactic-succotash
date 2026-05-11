"use client";

import TableDataGrid from "@/components/TableDataGrid";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import fields from "@/data/dashboard/logs/fields";
import type {
    AdminLogRow as TableRow,
    AdminLogRowInsert as TableRowInsert,
} from "@/db/types";
import {
    createRowAction,
    getRowsAction,
    updateRowAction,
} from "@/lib/dashboard/logs/function";

/**
 * Renders the protected logs dashboard page.
 */
export default function Page() {
    return (
        <TableDataGrid<TableRow, TableRowInsert>
            createRowAction={createRowAction}
            fields={fields}
            getRowsAction={getRowsAction}
            updateRowAction={updateRowAction}
            extraButtons={
                <ExtraToolbarButtons
                    createRowAction={{
                        type: "direct",
                        action: createRowAction,
                    }}
                />
            }
        />
    );
}
