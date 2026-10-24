"use client";

import type {
    ServerRoleBanRow as TableRow,
    ServerRoleBanRowInsert as TableRowInsert,
} from "@/db/types";

import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import TableDataGrid from "@/components/TableDataGrid";
import fields from "@/data/dashboard/role-bans/fields";
import { getRowsAction } from "@/lib/dashboard/role-bans/function";

/**
 * Renders the protected role-bans dashboard page.
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
