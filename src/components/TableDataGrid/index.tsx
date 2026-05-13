"use client";

import React, { useEffect, useState } from "react";
import CustomDataGrid from "./CustomDataGrid";
import type { FieldConfig } from "./types";
import { useSnackbar } from "@/providers/snackbar";
import CustomToolbar from "./Toolbar";
import { GridRowsProp } from "@mui/x-data-grid";
import { Box, CircularProgress } from "@mui/material";
import { columnsFromFields } from "@/utils/columns";

export type { FieldConfig } from "./types";

/**
 * Renders a read-only table data grid backed by the provided row loader.
 */
export default function TableDataGrid<
    R extends Record<string, unknown>,
    RI extends Record<string, unknown>,
>({
    getRowsAction,
    extraButtons,
    fields,
}: Readonly<{
    getRowsAction: () => Promise<Readonly<GridRowsProp>>;
    extraButtons?: React.ReactNode;
    fields: FieldConfig<R, RI>[];
}>) {
    const { showError } = useSnackbar();
    const [currentRows, setCurrentRows] =
        useState<Readonly<GridRowsProp> | null>(null);

    useEffect(() => {
        let active = true;

        getRowsAction()
            .then((rows) => {
                if (active) setCurrentRows(rows);
            })
            .catch((err: unknown) => {
                if (active) {
                    showError(err);
                    setCurrentRows([]);
                }
            });

        return () => {
            active = false;
        };
    }, [getRowsAction, showError]);

    const columns = columnsFromFields(fields);

    if (currentRows === null) {
        return (
            <Box
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <CustomDataGrid
            columns={columns}
            rows={currentRows}
            slots={{ toolbar: CustomToolbar }}
            slotProps={{
                toolbar: {
                    extraButtons,
                },
            }}
        />
    );
}
