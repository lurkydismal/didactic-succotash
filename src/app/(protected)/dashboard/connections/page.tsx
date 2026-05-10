"use client";

import TableDataGrid from "@/components/TableDataGrid";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import fields from "@/data/dashboard/connections/fields";
import type {
    ConnectionLogRow as TableRow,
    ConnectionLogRowInsert as TableRowInsert,
} from "@/db/types";
import {
    createRowAction,
    getRowsAction,
    updateRowAction,
} from "@/lib/dashboard/connections/function";

/**
 * Renders the protected connections dashboard page.
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
