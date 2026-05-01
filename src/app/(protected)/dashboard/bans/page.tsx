"use client";

import TableDataGrid from "@/components/TableDataGrid";
import {
    ServerBanRow as TableRow,
    ServerBanRowInsert as TableRowInsert,
} from "@/db/types";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import fields from "@/data/dashboard/bans/fields";
import {
    createRowAction,
    getRowsAction,
    getPlayerUsernameOptionsAction,
    updateRowAction,
} from "@/lib/dashboard/bans/function";
import { FieldConfig } from "@/components/TableDataGrid/RowDialog";
import { useEffect, useState } from "react";

export default function Page() {
    const [resolvedFields, setResolvedFields] =
        useState<FieldConfig<TableRow, TableRowInsert>[]>(fields);

    useEffect(() => {
        const loadPlayerOptions = async () => {
            const options = await getPlayerUsernameOptionsAction();
            setResolvedFields((prev) =>
                prev.map((field) =>
                    field.key === "playerUsername" ||
                    field.key === "banningAdmin"
                        ? {
                              ...field,
                              autocompleteOptions: options,
                          }
                        : field,
                ),
            );
        };

        void loadPlayerOptions();
    }, []);

    return (
        <TableDataGrid<TableRow, TableRowInsert>
            createRowAction={createRowAction}
            fields={resolvedFields}
            getRowsAction={getRowsAction}
            updateRowAction={updateRowAction}
            extraButtons={
                <ExtraToolbarButtons createRowAction={createRowAction} />
            }
        />
    );
}
