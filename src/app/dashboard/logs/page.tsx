"use client";

import type { AdminLogRow as TableRow, AdminLogRowInsert as TableRowInsert } from "@/db/types";

import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import TableDataGrid from "@/components/TableDataGrid";
import fields from "@/data/dashboard/logs/fields";
import { getRowsAction } from "@/lib/dashboard/logs/function";

/**
 * Renders the protected logs dashboard page.
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
