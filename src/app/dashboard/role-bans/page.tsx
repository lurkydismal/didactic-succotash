"use client";

import TableDataGrid from "@/components/TableDataGrid";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import fields from "@/data/dashboard/role-bans/fields";
import type {
    ServerRoleBanRow as TableRow,
    ServerRoleBanRowInsert as TableRowInsert,
} from "@/db/types";
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
