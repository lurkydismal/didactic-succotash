import { formatDate } from "@/utils/dayjs";
import { useSnackbar } from "@/providers/snackbar";
import { isBlob } from "@/utils/stdfunc";
import { Dayjs } from "dayjs";
import { Divider, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { RegisterOptions, useForm } from "react-hook-form";
import { CreateRowAction, FieldConfig, UpdateRowAction } from "./types";
import CustomFieldInput from "./CustomFieldInput";
import DateTimeFieldInput from "./DateTimeFieldInput";
import MultilineFieldInput from "./MultilineFieldInput";
import TextFieldInput from "./TextFieldInput";
import AutocompleteFieldInput from "./AutocompleteFieldInput";

type RowDialogContentProps<R, RI> = {
    row: R;
    fields: FieldConfig<R, RI>[];
    registerSubmit: (fn: (() => Promise<boolean>) | null) => void;
    createRowAction: CreateRowAction<RI>;
    updateRowAction: UpdateRowAction;
    onUpdated?: () => Promise<void> | void;
    idKey?: keyof R; // defaults to "id"
};

export default function RowDialogContent<
    R extends Record<string, unknown>,
    RI extends Record<string, unknown>,
>({
    row,
    fields,
    registerSubmit,
    createRowAction,
    updateRowAction,
    onUpdated,
    idKey = "id" as keyof R,
}: RowDialogContentProps<R, RI>) {
    const { showError } = useSnackbar();
    const formRef = useRef<HTMLFormElement | null>(null);
    const form = useForm<Record<string, unknown>>({
        defaultValues: buildInitial(),
        mode: "onSubmit",
    });

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
        form.reset(buildInitial());
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

    const createRow = useCallback(
        async (valuesToCreate: Partial<RI>): Promise<boolean> => {
            try {
                await createRowAction(valuesToCreate as RI);
                await onUpdated?.();
                return true;
            } catch (error) {
                showError(error);
                return false;
            }
        },
        [createRowAction, onUpdated, showError],
    );

    const submit = useCallback(async (): Promise<boolean> => {
        const valid = await form.trigger();
        if (!valid) return false;

        const currentValues = form.getValues() as Partial<RI>;

        const hasId =
            ((row as Record<string, unknown>)[String(idKey)] ?? null) !== null;

        if (hasId && !defaultIsChanged(row, currentValues)) {
            return true;
        }

        if (!hasId) {
            return await createRow(currentValues);
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
    }, [createRow, defaultIsChanged, fields, form, idKey, row, updateRow]);

    const getRules = (
        field: FieldConfig<R, RI>,
    ): RegisterOptions<Record<string, unknown>, string> => ({
        required: field.required ? `${field.label} is required` : false,
        validate: field.validate
            ? async (value) =>
                  (await field.validate?.(value, row, form.getValues())) ?? true
            : undefined,
    });

    useEffect(() => {
        registerSubmit(submit);
        return () => registerSubmit(null);
    }, [registerSubmit, submit]);

    const renderField = (field: FieldConfig<R, RI>, idx: number) => {
        const key = String(field.key);
        const name = field.name ?? key;
        const value = values[key];
        const error = form.formState.errors[name];
        const rules = getRules(field);

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
                    control={form.control}
                    error={error}
                    rules={rules}
                />
            );
        }

        if (field.type === "autocomplete") {
            return (
                <AutocompleteFieldInput
                    key={`${key}-${idx}`}
                    fieldKey={key}
                    label={field.label}
                    name={name}
                    required={!!field.required}
                    value={value}
                    options={field.autocompleteOptions ?? []}
                    loading={field.autocompleteLoading}
                    open={field.autocompleteOpen}
                    onOpen={field.onAutocompleteOpen}
                    onClose={field.onAutocompleteClose}
                    onValueChange={(nextValue) => setValue(key, nextValue)}
                    control={form.control}
                    error={error}
                    rules={rules}
                />
            );
        }

        if (
            field.type === "date" ||
            field.type === "time" ||
            field.type === "datetime"
        ) {
            return (
                <DateTimeFieldInput
                    key={`${key}-${idx}`}
                    fieldKey={key}
                    label={field.label}
                    name={name}
                    required={!!field.required}
                    type={field.type}
                    value={value}
                    onValueChange={(nextValue) => setValue(key, nextValue)}
                    control={form.control}
                    error={error}
                    rules={rules}
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
                control={form.control}
                error={error}
                rules={rules}
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
                            (
                                row as unknown as {
                                    created_at: string | Date | Dayjs;
                                }
                            ).created_at,
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
                            (
                                row as unknown as {
                                    updated_at: string | Date | Dayjs;
                                }
                            ).updated_at,
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
