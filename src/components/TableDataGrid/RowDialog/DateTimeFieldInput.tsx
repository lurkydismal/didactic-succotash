import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Typography } from "@mui/material";
import { Control, Controller, FieldError, RegisterOptions } from "react-hook-form";

type DateTimeFieldInputProps = {
    fieldKey: string;
    label: string;
    name: string;
    required: boolean;
    type: "date" | "time" | "datetime";
    value: unknown;
    control: Control<Record<string, unknown>>;
    error?: FieldError;
    rules?: RegisterOptions<Record<string, unknown>, string>;
    onValueChange: (value: string | null) => void;
};

export default function DateTimeFieldInput({
    fieldKey,
    label,
    name,
    required,
    type,
    value,
    control,
    error,
    rules,
    onValueChange,
}: DateTimeFieldInputProps) {
    const handleChange = (nextValue: Dayjs | null) => {
        if (!nextValue || !nextValue.isValid()) {
            onValueChange(null);
            return;
        }

        if (type === "date") {
            onValueChange(nextValue.format("YYYY-MM-DD"));
            return;
        }

        if (type === "time") {
            onValueChange(nextValue.format("HH:mm:ss"));
            return;
        }

        onValueChange(nextValue.toISOString());
    };

    return (
        <div>
            <Typography variant="subtitle1" color="text.secondary">
                {label}
            </Typography>

            {type === "date" && (
                <Controller
                    name={name}
                    control={control}
                    defaultValue={value ?? null}
                    rules={rules}
                    render={({ field }) => (
                <DatePicker
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(next) => {
                        handleChange(next);
                        field.onChange(next?.isValid() ? next.format("YYYY-MM-DD") : null);
                    }}
                    slotProps={{
                        textField: {
                            id: `${fieldKey}-date`,
                            name,
                            required,
                            fullWidth: true,
                            error: !!error,
                            helperText: error?.message,
                        },
                    }}
                />
                    )}
                />
            )}

            {type === "time" && (
                <Controller
                    name={name}
                    control={control}
                    defaultValue={value ?? null}
                    rules={rules}
                    render={({ field }) => (
                <TimePicker
                    value={field.value ? dayjs(field.value, "HH:mm:ss") : null}
                    onChange={(next) => {
                        handleChange(next);
                        field.onChange(next?.isValid() ? next.format("HH:mm:ss") : null);
                    }}
                    slotProps={{
                        textField: {
                            id: `${fieldKey}-time`,
                            name,
                            required,
                            fullWidth: true,
                            error: !!error,
                            helperText: error?.message,
                        },
                    }}
                />
                    )}
                />
            )}

            {type === "datetime" && (
                <Controller
                    name={name}
                    control={control}
                    defaultValue={value ?? null}
                    rules={rules}
                    render={({ field }) => (
                <DateTimePicker
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(next) => {
                        handleChange(next);
                        field.onChange(next?.isValid() ? next.toISOString() : null);
                    }}
                    slotProps={{
                        textField: {
                            id: `${fieldKey}-datetime`,
                            name,
                            required,
                            fullWidth: true,
                            error: !!error,
                            helperText: error?.message,
                        },
                    }}
                />
                    )}
                />
            )}
        </div>
    );
}
