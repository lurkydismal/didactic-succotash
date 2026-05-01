import AutocompleteWithHighlight from "@/components/Autocomplete";
import { CircularProgress, TextField, Typography } from "@mui/material";
import { AutocompleteOption } from "./types";

type AutocompleteFieldInputProps = {
    fieldKey: string;
    label: string;
    name: string;
    required: boolean;
    value: unknown;
    options: readonly AutocompleteOption[];
    loading?: boolean;
    open?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    onValueChange: (value: AutocompleteOption | null) => void;
};

export default function AutocompleteFieldInput({
    fieldKey,
    label,
    name,
    required,
    value,
    options,
    loading = false,
    open,
    onOpen,
    onClose,
    onValueChange,
}: AutocompleteFieldInputProps) {
    return (
        <div>
            <Typography variant="subtitle1" color="text.secondary">
                {label}
            </Typography>
            <AutocompleteWithHighlight
                value={value ?? null}
                options={options}
                open={open}
                onOpen={onOpen}
                onClose={onClose}
                loading={loading}
                onChange={(_, nextValue) =>
                    onValueChange(nextValue as AutocompleteOption | null)
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        name={name}
                        id={`${fieldKey}-autocomplete`}
                        required={required}
                        placeholder={label}
                        slotProps={{
                            ...params.slotProps,
                            input: {
                                ...params.slotProps.input,
                                endAdornment: (
                                    <>
                                        {loading ? (
                                            <CircularProgress
                                                color="inherit"
                                                size={20}
                                            />
                                        ) : null}
                                        {params.slotProps.input.endAdornment}
                                    </>
                                ),
                            },
                        }}
                        fullWidth
                    />
                )}
                fullWidth
            />
        </div>
    );
}
