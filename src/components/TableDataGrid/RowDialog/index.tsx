import { formatDate } from "@/utils/dayjs";
import { useSnackbar } from "@/providers/snackbar";
import { isBlob } from "@/utils/stdfunc";
import log from "@/utils/stdlog";
import { Dayjs } from "dayjs";
import {
    Dialog,
    DialogContent,
    Divider,
    Grid,
    Typography,
} from "@mui/material";
import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import CustomFieldInput from "./CustomFieldInput";
import MultilineFieldInput from "./MultilineFieldInput";
import TextFieldInput from "./TextFieldInput";
import { FieldConfig, UpdateRowAction } from "./types";

export type { FieldConfig } from "./types";

type RowDialogContentProps<R, RI> = {
    row: R;
    fields: FieldConfig<R, RI>[];
    registerSubmit: (fn: (() => Promise<boolean>) | null) => void;
    updateRowAction: UpdateRowAction;
    onUpdated?: () => Promise<void> | void;
    idKey?: keyof R;
};

function RowDialogContent<
    R extends Record<string, unknown>,
    RI extends Record<string, unknown>,
>({
    row,
    fields,
    registerSubmit,
    updateRowAction,
    onUpdated,
    idKey = "id" as keyof R,
}: RowDialogContentProps<R, RI>) {
    const { showError } = useSnackbar();
    const formRef = useRef<HTMLFormElement | null>(null);

    const buildInitial = () => {
        const out: Record<string, unknown> = {};
        for (const field of fields) {
            const key = String(field.key);
            out[key] = (row as Record<string, unknown>)[key] ?? null;
        }
        return out;
    };

    const [values, setValues] =
        useState<Record<string, unknown>>(buildInitial());

    useEffect(() => {
        setValues(buildInitial());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [row]);

    const setValue = (key: string, value: unknown) =>
        setValues((state) => ({ ...state, [key]: value }));

    const defaultIsChanged = useCallback(
        (rowObj: R, newValues: Partial<RI>) => {
            for (const field of fields) {
                const key = String(field.key);
                const rowVal = (rowObj as Record<string, unknown>)[key];
                const newVal = (newValues as Record<string, unknown>)[key];
                const equal =
                    typeof field.isChanged === "function"
                        ? !field.isChanged(rowVal, newVal)
                        : String((rowVal ?? "").toString()).trim() ===
                          String((newVal ?? "").toString()).trim();

                if (!equal) {
                    return true;
                }
            }

            return false;
        },
        [fields],
    );

    const updateRow = useCallback(
        async (fd: FormData): Promise<boolean> => {
            try {
                await updateRowAction(fd);
                await onUpdated?.();
                return true;
            } catch (error) {
                showError(error);
                return false;
            }
        },
        [onUpdated, showError, updateRowAction],
    );

    const submit = useCallback(async (): Promise<boolean> => {
        const currentValues = values as Partial<RI>;

        if (!defaultIsChanged(row, currentValues)) {
            return true;
        }

        const fd = new FormData(formRef.current ?? undefined);

        for (const field of fields) {
            const name = field.name ?? String(field.key);
            const key = String(field.key);
            const value = currentValues[key];

            if (field.toFormValue) {
                const mappedValue = field.toFormValue(value);
                if (mappedValue !== undefined) fd.set(name, mappedValue);
            } else if (value === null || value === undefined) {
                if (!fd.has(name)) fd.set(name, "");
            } else if (isBlob(value)) {
                fd.set(name, value);
            } else {
                fd.set(name, String(value));
            }
        }

        return await updateRow(fd);
    }, [defaultIsChanged, fields, row, updateRow, values]);

    useEffect(() => {
        registerSubmit(submit);
        return () => registerSubmit(null);
    }, [registerSubmit, submit]);

    const renderField = (field: FieldConfig<R, RI>, idx: number) => {
        const key = String(field.key);
        const name = field.name ?? key;
        const value = values[key];

        if (typeof field.render === "function") {
            return (
                <CustomFieldInput
                    key={`${key}-${idx}`}
                    field={field}
                    value={value}
                    row={row}
                    onValueChange={(nextValue) => setValue(key, nextValue)}
                />
            );
        }

        if (field.type === "multiline") {
            return (
                <MultilineFieldInput
                    key={`${key}-${idx}`}
                    fieldKey={key}
                    label={field.label}
                    name={name}
                    required={!!field.required}
                    value={value}
                    onValueChange={(nextValue) => setValue(key, nextValue)}
                />
            );
        }

        return (
            <TextFieldInput
                key={`${key}-${idx}`}
                fieldKey={key}
                label={field.label}
                name={name}
                required={!!field.required}
                value={value}
                onValueChange={(nextValue) => setValue(key, nextValue)}
            />
        );
    };

    return (
        <form
            ref={formRef}
            onSubmit={(event) => {
                event.preventDefault();
                submit();
            }}
        >
            <Grid container spacing={2}>
                {((row as Record<string, unknown>)[String(idKey)] ?? null) !==
                    null && (
                    <input
                        type="hidden"
                        name={String(idKey)}
                        value={String(
                            (row as Record<string, unknown>)[String(idKey)],
                        )}
                    />
                )}

                {fields.map((field, index) => (
                    <Grid
                        size={{ xs: 12, sm: field.size ?? 6 }}
                        key={`${String(field.key)}-${index}`}
                    >
                        {renderField(field, index)}
                    </Grid>
                ))}

                <Grid size={{ xs: 12 }}>
                    <Divider />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Created
                    </Typography>
                    <Typography variant="subtitle2" sx={{ display: "block" }}>
                        {formatDate(
                            (row as { created_at: string | Date | Dayjs })
                                .created_at,
                            true,
                        )}
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Updated
                    </Typography>
                    <Typography variant="subtitle2" sx={{ display: "block" }}>
                        {formatDate(
                            (row as { updated_at: string | Date | Dayjs })
                                .updated_at,
                            true,
                        )}
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Author
                    </Typography>
                    <Typography variant="subtitle2" sx={{ display: "block" }}>
                        {(row as { author?: string }).author ?? "—"}
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Last editor
                    </Typography>
                    <Typography variant="subtitle2" sx={{ display: "block" }}>
                        {(row as { last_editor?: string }).last_editor ?? "—"}
                    </Typography>
                </Grid>
            </Grid>
        </form>
    );
}

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
