"use client";

import CustomDivider from "@/components/TableDataGrid/CustomDivider";
import { useSnackbar } from "@/providers/snackbar";
import uuid from "@/utils/uuid";
import {
    Queue as MockShowIcon,
    AddBoxOutlined as AddIcon,
} from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { ToolbarButton } from "@mui/x-data-grid";

type CreateRowAction<RI extends Record<string, unknown>> =
    | (() => void)
    | ((row: RI) => Promise<void>);

function isDialogCreateAction<RI extends Record<string, unknown>>(
    createRowAction: CreateRowAction<RI>,
): createRowAction is () => void {
    return createRowAction.length === 0;
}

/**
 * Renders the extra toolbar buttons component.
 */
export default function ExtraToolbarButtons<
    // R extends Record<string, unknown>,
    RI extends Record<string, unknown>,
>({
    emptyRow,
    createRowAction,
}: Readonly<{
    emptyRow?: RI;
    createRowAction: CreateRowAction<RI>;
}>) {
    const { showMessage, showSuccess, showError, showWarning, showInfo } =
        useSnackbar();

    return (
        <>
            <Tooltip title="Show nock snackbars">
                <ToolbarButton
                    onClick={() => {
                        showMessage(uuid());
                        showSuccess(uuid());
                        showError(uuid());
                        showWarning(uuid());
                        showInfo(uuid());
                    }}
                >
                    <MockShowIcon fontSize="small" />
                </ToolbarButton>
            </Tooltip>

            <Tooltip title="Add new row">
                <ToolbarButton
                    onClick={() => {
                        if (!emptyRow || !isDialogCreateAction(createRowAction))
                            return;
                        createRowAction();
                    }}
                >
                    <AddIcon fontSize="small" />
                </ToolbarButton>
            </Tooltip>

            <CustomDivider />
        </>
    );
}
