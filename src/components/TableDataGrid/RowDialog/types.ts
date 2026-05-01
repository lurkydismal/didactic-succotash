export type DefaultFieldType = "text" | "multiline" | "custom";

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
    render?: (
        value: unknown,
        setValue: (v: unknown) => void,
        row: R,
    ) => React.ReactNode;
    toFormValue?: (v: unknown) => string | Blob | undefined;
    isChanged?: (rowValue: unknown, currentValue: unknown) => boolean;
};

export type UpdateRowAction = (fd: FormData) => Promise<void>;
