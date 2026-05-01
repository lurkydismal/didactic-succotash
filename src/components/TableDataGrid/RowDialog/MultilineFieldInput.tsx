import { ChangeEvent } from "react";
import { TextField, Typography } from "@mui/material";
import { Control, Controller, FieldError, RegisterOptions } from "react-hook-form";

type MultilineFieldInputProps = {
    fieldKey: string;
    label: string;
    name: string;
    required: boolean;
    value: unknown;
    control: Control<Record<string, unknown>>;
    error?: FieldError;
    rules?: RegisterOptions<Record<string, unknown>, string>;
    onValueChange: (value: string) => void;
};

export default function MultilineFieldInput({
    fieldKey,
    label,
    name,
    required,
    value,
    control,
    error,
    rules,
    onValueChange,
}: MultilineFieldInputProps) {
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
                        id={`${fieldKey}-multiline`}
                        value={field.value ?? ""}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            field.onChange(e.target.value);
                            onValueChange(e.target.value);
                        }}
                        multiline
                        fullWidth
                        minRows={4}
                        maxRows={8}
                        error={!!error}
                        helperText={error?.message}
                    />
                )}
            />
        </div>
    );
}
