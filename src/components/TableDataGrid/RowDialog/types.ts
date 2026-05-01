export type AutocompleteOption = string | number | boolean | { label: string };

export type DefaultFieldType =
    | "text"
    | "multiline"
    | "custom"
    | "autocomplete"
    | "date"
    | "time"
    | "datetime";

export type FieldConfig<
    R,
    RI = unknown,
    K extends PropertyKey = keyof R | keyof RI | string,
> = {
    key: K; // property key in row/insert (string allowed for synthetic fields)
    label: string;
    type?: DefaultFieldType;
    name?: string; // form field name (defaults to key)
    size?: number; // value passed to Grid xs/sm/etc (use 12, 6, 4)
    required?: boolean;
    placeholder?: unknown;
    autocompleteOptions?: readonly AutocompleteOption[];
    autocompleteLoading?: boolean;
    autocompleteOpen?: boolean;
    onAutocompleteOpen?: () => void;
    onAutocompleteClose?: () => void;
    // optional custom render: (value, setValue, row) => ReactNode
    render?: (
        value: unknown,
        setValue: (v: unknown) => void,
        row: R,
    ) => React.ReactNode;
    // convert local value to form payload value
    toFormValue?: (v: unknown) => string | Blob | undefined;
    // optional comparator for this field
    isChanged?: (rowValue: unknown, currentValue: unknown) => boolean;
    validate?: (
        value: unknown,
        row: R,
        values: Record<string, unknown>,
    ) => true | string | Promise<true | string>;
};

export type UpdateRowAction = (fd: FormData) => Promise<void>;
