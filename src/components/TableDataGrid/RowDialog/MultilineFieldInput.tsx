import { ChangeEvent } from "react";
import { TextField, Typography } from "@mui/material";

type MultilineFieldInputProps = {
    fieldKey: string;
    label: string;
    name: string;
    required: boolean;
    value: unknown;
    onValueChange: (value: string) => void;
};

export default function MultilineFieldInput({
    fieldKey,
    label,
    name,
    required,
    value,
    onValueChange,
}: MultilineFieldInputProps) {
    return (
        <div>
            <Typography variant="subtitle1" color="text.secondary">
                {label}
            </Typography>
            <TextField
                name={name}
                required={required}
                id={`${fieldKey}-multiline`}
                value={value ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onValueChange(e.target.value)
                }
                multiline
                fullWidth
                minRows={4}
                maxRows={8}
            />
        </div>
    );
}
