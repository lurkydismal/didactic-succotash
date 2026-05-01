import log from "@/utils/stdlog";
import { Dialog, DialogContent } from "@mui/material";
import { Dispatch, SetStateAction, useRef } from "react";
import { FieldConfig, UpdateRowAction } from "./types";
import RowDialogContent from "./Content";

export type { FieldConfig } from "./types";

export default function RowDialog<
    R extends Record<string, unknown>,
    RI extends Record<string, unknown>,
>({
    dialogOpen,
    handleClose,
    selectedRow,
    setSelectedRow,
    updateRowAction,
    onUpdated,
    fields,
    idKey = "id" as keyof R,
}: {
    dialogOpen: boolean;
    handleClose: () => void;
    selectedRow: R | null;
    setSelectedRow: Dispatch<SetStateAction<R | null>>;
    updateRowAction: UpdateRowAction;
    onUpdated?: () => Promise<void> | void;
    fields: FieldConfig<R, RI>[];
    idKey?: keyof R;
}) {
    const submitFnRef = useRef<(() => Promise<boolean>) | null>(null);

    const registerSubmit = (fn: (() => Promise<boolean>) | null) => {
        submitFnRef.current = fn;
    };

    const onClose = async () => {
        if (submitFnRef.current) {
            try {
                const ok = await submitFnRef.current();
                if (!ok) return;
            } catch (error) {
                log.error("Failed to submit dialog form on close", error);
                return;
            }
        }

        handleClose();
    };

    return (
        <Dialog
            open={dialogOpen}
            onClose={() => onClose()}
            maxWidth="md"
            fullWidth
            keepMounted
            slotProps={{
                transition: {
                    onExited: () => {
                        setSelectedRow(null);
                    },
                },
            }}
        >
            <DialogContent>
                {selectedRow && (
                    <RowDialogContent<R, RI>
                        row={selectedRow}
                        fields={fields}
                        registerSubmit={registerSubmit}
                        updateRowAction={updateRowAction}
                        onUpdated={onUpdated}
                        idKey={idKey}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
