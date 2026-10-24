"use client";

import type {
    ConnectionLogRow as TableRow,
    ConnectionLogRowInsert as TableRowInsert,
} from "@/db/types";

import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import TableDataGrid from "@/components/TableDataGrid";
import fields from "@/data/dashboard/connections/fields";
import { getRowsAction } from "@/lib/dashboard/connections/function";

/**
 * Renders the protected connections dashboard page.
 */
export default function Page() {
    return (
        <TableDataGrid<TableRow, TableRowInsert>
            fields={fields}
            getRowsAction={getRowsAction}
            extraButtons={<ExtraToolbarButtons />}
        />
    );
}
