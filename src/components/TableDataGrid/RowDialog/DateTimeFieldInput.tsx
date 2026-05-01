import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Typography } from "@mui/material";

type DateTimeFieldInputProps = {
    fieldKey: string;
    label: string;
    name: string;
    required: boolean;
    type: "date" | "time" | "datetime";
    value: unknown;
    onValueChange: (value: string | null) => void;
};

export default function DateTimeFieldInput({
    fieldKey,
    label,
    name,
    required,
    type,
    value,
    onValueChange,
}: DateTimeFieldInputProps) {
    const pickerValue: Dayjs | null =
        typeof value === "string" ||
        value instanceof Date ||
        dayjs.isDayjs(value)
            ? dayjs(value)
            : null;

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
                <DatePicker
                    value={pickerValue}
                    onChange={handleChange}
                    slotProps={{
                        textField: {
                            id: `${fieldKey}-date`,
                            name,
                            required,
                            fullWidth: true,
                        },
                    }}
                />
            )}

            {type === "time" && (
                <TimePicker
                    value={pickerValue}
                    onChange={handleChange}
                    slotProps={{
                        textField: {
                            id: `${fieldKey}-time`,
                            name,
                            required,
                            fullWidth: true,
                        },
                    }}
                />
            )}

            {type === "datetime" && (
                <DateTimePicker
                    value={pickerValue}
                    onChange={handleChange}
                    slotProps={{
                        textField: {
                            id: `${fieldKey}-datetime`,
                            name,
                            required,
                            fullWidth: true,
                        },
                    }}
                />
            )}
        </div>
    );
}
