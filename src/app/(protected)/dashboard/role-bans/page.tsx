"use client";

import TableDataGrid from "@/components/TableDataGrid";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import fields from "@/data/dashboard/role-bans/fields";
import type {
    ServerRoleBanRow as TableRow,
    ServerRoleBanRowInsert as TableRowInsert,
} from "@/db/types";
import {
    createRowAction,
    getRowsAction,
    updateRowAction,
} from "@/lib/dashboard/role-bans/function";

/**
 * Renders the protected role-bans dashboard page.
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
