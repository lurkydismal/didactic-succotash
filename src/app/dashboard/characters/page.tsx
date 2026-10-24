"use client";

import type { ProfileRow as TableRow, ProfileRowInsert as TableRowInsert } from "@/db/types";

import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import TableDataGrid from "@/components/TableDataGrid";
import fields from "@/data/dashboard/characters/fields";
import { getRowsAction } from "@/lib/dashboard/characters/function";

/**
 * Renders the protected characters dashboard page.
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
