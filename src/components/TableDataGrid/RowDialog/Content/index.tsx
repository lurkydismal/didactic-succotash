import { useSnackbar } from "@/providers/snackbar";
import { Divider, Grid } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { RegisterOptions, useForm } from "react-hook-form";
import { CreateRowAction, FieldConfig, UpdateRowAction } from "../types";
import { rowHasChanges, rowHasId } from "./changeDetection";
import { buildUpdateFormData } from "./formData";
import { buildInitialValues } from "./helpers";
import MetadataFields from "./MetadataFields";
import { renderField } from "./renderField";
import { getFieldRules } from "./validation";

type RowDialogContentProps<R, RI> = {
    row: R;
    fields: FieldConfig<R, RI>[];
    registerSubmit: (fn: (() => Promise<boolean>) | null) => void;
    createRowAction: CreateRowAction<RI>;
    updateRowAction: UpdateRowAction;
    onUpdated?: () => Promise<void> | void;
    idKey?: keyof R;
};

/**
 * Renders the row dialog content component.
 */
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
        defaultValues: buildInitialValues(row, fields),
        mode: "onSubmit",
    });

    const [values, setValues] = useState<Record<string, unknown>>(
        buildInitialValues(row, fields),
    );

    useEffect(() => {
        const initialValues = buildInitialValues(row, fields);
        setValues(initialValues);
        form.reset(initialValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [row]);

    /**
     * Stores an edited field value in local row dialog state.
     */
    const setValue = (key: string, value: unknown) =>
        setValues((state) => ({ ...state, [key]: value }));

    const setValueAndForm = useCallback(
        (key: string, value: unknown) => {
            setValue(key, value);
            form.setValue(key, value, {
                shouldDirty: true,
                shouldValidate: true,
            });
        },
        [form],
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
        const hasId = rowHasId(row, idKey);

        if (hasId && !rowHasChanges(row, currentValues, fields)) {
            return true;
        }

        if (!hasId) {
            return await createRow(currentValues);
        }

        const fd = buildUpdateFormData(formRef.current, fields, currentValues);

        return await updateRow(fd);
    }, [createRow, fields, form, idKey, row, updateRow]);

    const getRules: (
        field: FieldConfig<R, RI>,
    ) => RegisterOptions<Record<string, unknown>, string> = useCallback(
        (field) => getFieldRules(field, fields, form, row, values),
        [fields, form, row, values],
    );

    useEffect(() => {
        registerSubmit(submit);
        return () => registerSubmit(null);
    }, [registerSubmit, submit]);

    return (
        <form
            ref={formRef}
            onSubmit={(event) => {
                event.preventDefault();
                submit();
            }}
        >
            <Grid container spacing={2}>
                {rowHasId(row, idKey) && (
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
                        {renderField<R, RI>({
                            field,
                            idx: index,
                            row,
                            values,
                            form,
                            getRules,
                            setValue,
                            setValueAndForm,
                        })}
                    </Grid>
                ))}

                <Grid size={{ xs: 12 }}>
                    <Divider />
                </Grid>

                <MetadataFields row={row} />
            </Grid>
        </form>
    );
}
