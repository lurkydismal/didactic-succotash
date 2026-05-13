"use client";

import CustomDivider from "@/components/TableDataGrid/CustomDivider";
import { useSnackbar } from "@/providers/snackbar";
import uuid from "@/utils/uuid";
import { Queue as MockShowIcon } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { ToolbarButton } from "@mui/x-data-grid";

/**
 * Renders extra read-only dashboard toolbar buttons.
 */
export default function ExtraToolbarButtons() {
    const { showMessage, showSuccess, showError, showWarning, showInfo } =
        useSnackbar();

    return (
        <>
            <Tooltip title="Show mock snackbars">
                <ToolbarButton
                    aria-label="Show mock snackbars"
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

            <CustomDivider />
        </>
    );
}
