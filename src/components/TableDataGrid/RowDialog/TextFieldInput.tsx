import { ChangeEvent } from "react";
import { TextField, Typography } from "@mui/material";
import {
    Control,
    Controller,
    FieldError,
    RegisterOptions,
} from "react-hook-form";

type TextFieldInputProps = {
    fieldKey: string;
    label: string;
    name: string;
    required: boolean;
    value: unknown;
    control: Control<Record<string, unknown>>;
    error?: FieldError;
    rules?: RegisterOptions<Record<string, unknown>, string>;
    onValueChange: (value: string) => void;
    multiline?: boolean;
};

/**
 * Renders a text field input component. Pass `multiline` for a resizable textarea.
 */
export default function TextFieldInput({
    fieldKey,
    label,
    name,
    required,
    value,
    control,
    error,
    rules,
    onValueChange,
    multiline = false,
}: TextFieldInputProps) {
    return (
        <div>
            <Typography variant="subtitle1" color="text.secondary">
                {label}
            </Typography>
            <Controller
                name={name}
                control={control}
                defaultValue={value ?? ""}
                rules={rules}
                render={({ field }) => (
                    <TextField
                        {...field}
                        required={required}
                        id={`${fieldKey}-${multiline ? "multiline" : "text"}`}
                        value={field.value ?? ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            field.onChange(e.target.value);
                            onValueChange(e.target.value);
                        }}
                        multiline={multiline}
                        {...(multiline && { minRows: 4, maxRows: 8 })}
                        error={!!error}
                        helperText={error?.message}
                        fullWidth
                    />
                )}
            />
        </div>
    );
}
