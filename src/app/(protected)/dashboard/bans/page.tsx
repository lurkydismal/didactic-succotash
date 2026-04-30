"use client";

import TableDataGrid from "@/components/TableDataGrid";
import {
    ServerBanRow as TableRow,
    ServerBanRowInsert as TableRowInsert,
} from "@/db/types";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import fields from "@/data/dashboard/bans/fields";
import { createRowAction, getRowsAction, updateRowAction } from "@/lib/dashboard/bans/function";
import { uuid4 } from "@/utils/uuid";
import { serverBan } from "@/db/schema";

export default function Page() {
    const emptyRow: TableRowInsert = {
        playerUserId: uuid4(),
        reason: "123",
        banTime: new Date(),
    };

    return (
        <TableDataGrid<TableRow, TableRowInsert>
            createRowAction={createRowAction}
            emptyRow={emptyRow}
            fields={fields}
            getRowsAction={getRowsAction}
            updateRowAction={updateRowAction}
            extraButtons={
                <ExtraToolbarButtons
                    emptyRow={emptyRow}
                    createRowAction={createRowAction}
                />
            }
        />
    );
}
