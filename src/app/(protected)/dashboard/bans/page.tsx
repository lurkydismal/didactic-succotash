"use client";

import TableDataGrid from "@/components/TableDataGrid";
import {
    ServerBanRow as TableRow,
    ServerBanRowInsert as TableRowInsert,
} from "@/db/types";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import fields from "@/data/dashboard/bans/fields";
import { makeCrudActions } from "@/lib/dashboard/common/actions";
import { serverBan } from "@/db/schema";

export default function Page() {
    const { getRowsAction, createRowAction, updateRowAction } = makeCrudActions<
        TableRow,
        TableRowInsert
    >("table", serverBan.serverBanId);

    const emptyRow: TableRowInsert = {
        serverBanId: 1,
        address: "123",
        reason: "-",
        banTime: new Date(),
    };

    // Optional: custom change detector (compares trimmed content)
    const isRowChanged = (row: TableRow, values: Partial<TableRowInsert>) => {
        const a = String(row.address ?? "").trim();
        const b = String(values.address ?? "").trim();
        return a !== b;
    };

    return (
        <TableDataGrid<TableRow, TableRowInsert>
            createRowAction={createRowAction}
            emptyRow={emptyRow}
            fields={fields}
            getRowsAction={getRowsAction}
            isRowChanged={isRowChanged}
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
