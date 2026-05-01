import { ChangeEvent } from "react";
import { TextField, Typography } from "@mui/material";

type TextFieldInputProps = {
    fieldKey: string;
    label: string;
    name: string;
    required: boolean;
    value: unknown;
    onValueChange: (value: string) => void;
};

export default function TextFieldInput({
    fieldKey,
    label,
    name,
    required,
    value,
    onValueChange,
}: TextFieldInputProps) {
    return (
        <div>
            <Typography variant="subtitle1" color="text.secondary">
                {label}
            </Typography>
            <TextField
                name={name}
                required={required}
                id={`${fieldKey}-text`}
                value={value ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onValueChange(e.target.value)
                }
                fullWidth
            />
        </div>
    );
}
