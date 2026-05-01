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
    getPlayerAddressOptionsAction,
    getPlayerHwidOptionsAction,
    getRowsAction,
    getPlayerUsernameOptionsAction,
    updateRowAction,
} from "@/lib/dashboard/bans/function";
import { FieldConfig } from "@/components/TableDataGrid/RowDialog";
import { useEffect, useState } from "react";
import MainFallback from "@/components/MainFallback";

export default function Page() {
    const [resolvedFields, setResolvedFields] =
        useState<FieldConfig<TableRow, TableRowInsert>[]>(fields);

    useEffect(() => {
        const loadPlayerOptions = async () => {
            const [usernameOptions, addressOptions, hwidOptions] =
                await Promise.all([
                    getPlayerUsernameOptionsAction(),
                    getPlayerAddressOptionsAction(),
                    getPlayerHwidOptionsAction(),
                ]);
            setResolvedFields((prev) =>
                prev.map((field) =>
                    field.key === "playerUsername" ||
                        field.key === "banningAdmin"
                        ? {
                            ...field,
                            autocompleteOptions: usernameOptions,
                        }
                        : field.key === "address"
                            ? {
                                ...field,
                                autocompleteOptions: addressOptions,
                            }
                            : field.key === "hwid"
                                ? {
                                    ...field,
                                    autocompleteOptions: hwidOptions,
                                }
                                : field,
                ),
            );
        };

        void loadPlayerOptions();
    }, []);

    return (
        <>
            <MainFallback itemsLength={0}>
                <TableDataGrid<TableRow, TableRowInsert>
                    createRowAction={createRowAction}
                    fields={resolvedFields}
                    getRowsAction={getRowsAction}
                    updateRowAction={updateRowAction}
                    extraButtons={
                        <ExtraToolbarButtons createRowAction={createRowAction} />
                    }
                />
            </MainFallback>
        </>
    );
}
