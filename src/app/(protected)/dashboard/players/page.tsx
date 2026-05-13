"use client";

import TableDataGrid from "@/components/TableDataGrid";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import fields from "@/data/dashboard/players/fields";
import type {
    PlayerRow as TableRow,
    PlayerRowInsert as TableRowInsert,
} from "@/db/types";
import { getRowsAction } from "@/lib/dashboard/players/function";

/**
 * Renders the protected players dashboard page.
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
