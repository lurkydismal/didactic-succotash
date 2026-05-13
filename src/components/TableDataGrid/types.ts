import type React from "react";

export type AutocompleteOption =
    | string
    | number
    | boolean
    | { label: string; packedValues?: Record<string, unknown> };

export type DefaultFieldType =
    | "text"
    | "multiline"
    | "custom"
    | "autocomplete"
    | "date"
    | "time"
    | "datetime";

export type FieldValueChangeResult =
    | void
    | Record<string, unknown>
    | Promise<void | Record<string, unknown>>;

export type FieldValueChangeContext<R> = {
    row: R;
    values: Record<string, unknown>;
};

export type FieldConfig<
    R,
    RI = unknown,
    K extends PropertyKey = keyof R | keyof RI | string,
> = {
    key: K;
    label: string;
    type?: DefaultFieldType;
    name?: string;
    size?: number;
    required?: boolean;
    readOnly?: boolean;
    hidden?: boolean;
    requiredGroup?: string;
    requiredGroupMin?: number;
    placeholder?: unknown;
    autocompleteOptions?: readonly AutocompleteOption[];
    loadOptions?: () => Promise<readonly AutocompleteOption[]>;
    autocompleteLoading?: boolean;
    autocompleteOpen?: boolean;
    onAutocompleteOpen?: () => void;
    onAutocompleteClose?: () => void;
    formatValue?: (value: unknown) => unknown;
    render?: (
        value: unknown,
        setValue: (v: unknown) => void,
        row: R,
    ) => React.ReactNode;
    toFormValue?: (v: unknown) => string | Blob | undefined;
    isChanged?: (rowValue: unknown, currentValue: unknown) => boolean;
    onValueChange?: (
        value: unknown,
        context: FieldValueChangeContext<R>,
    ) => FieldValueChangeResult;
    runOnDialogOpen?: boolean;
    validate?: (
        value: unknown,
        row: R,
        values: Record<string, unknown>,
    ) => true | string | Promise<true | string>;
};
