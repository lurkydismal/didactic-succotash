"use client";

import type { WhitelistRow as TableRow, WhitelistRowInsert as TableRowInsert } from "@/db/types";

import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import TableDataGrid from "@/components/TableDataGrid";
import fields from "@/data/dashboard/whitelist/fields";
import { getRowsAction } from "@/lib/dashboard/whitelist/function";

/**
 * Renders the protected whitelist dashboard page.
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
