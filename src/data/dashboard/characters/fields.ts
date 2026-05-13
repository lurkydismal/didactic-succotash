import type { FieldConfig } from "@/components/TableDataGrid";
import type {
    ProfileRow as TableRow,
    ProfileRowInsert as TableRowInsert,
} from "@/db/types";
import {
    getJobNameOptionsAction,
    getPlayerUsernameOptionsAction,
} from "@/lib/dashboard/characters/function";

/**
 * Loads player username options once for character ownership selection.
 */
const loadPlayerUsernameOptions = () => {
    return getPlayerUsernameOptionsAction();
};

/**
 * Loads distinct job names from the job table for Favorite job selection.
 */
const loadJobNameOptions = () => {
    return getJobNameOptionsAction();
};

/**
 * Formats a JSON database value as stable, readable text for grid cells and dialog fields.
 */
function formatJsonText(value: unknown): string {
    if (value === undefined || value === "") return "";

    if (typeof value === "string") {
        try {
            return JSON.stringify(JSON.parse(value), null, 2);
        } catch {
            // Preserve valid JSON text semantics for scalar strings.
            return JSON.stringify(value, null, 2);
        }
    }

    const serialized = JSON.stringify(value, null, 2);
    return serialized ?? String(value);
}

/**
 * Parses the JSON text entered in the logs dialog back into a JavaScript value.
 */
function parseJsonText(value: unknown): unknown {
    if (typeof value !== "string") return value;

    return JSON.parse(value);
}

/**
 * Validates that a logs JSON field contains syntactically valid JSON text.
 */
function validateJsonText(value: unknown): true | string {
    try {
        parseJsonText(value);
        return true;
    } catch {
        return "JSON must be valid";
    }
}

/**
 * Compares original and edited JSON values after parsing them into canonical text.
 */
function isJsonChanged(rowValue: unknown, currentValue: unknown): boolean {
    try {
        return (
            formatJsonText(rowValue) !==
            formatJsonText(parseJsonText(currentValue))
        );
    } catch {
        return formatJsonText(rowValue) !== String(currentValue ?? "");
    }
}

const fields: FieldConfig<TableRow, TableRowInsert>[] = [
    {
        key: "playerUsername",
        label: "Player",
        type: "autocomplete",
        autocompleteOptions: [],
        loadOptions: loadPlayerUsernameOptions,
        required: true,
    },
    {
        key: "charName",
        label: "Character name",
        type: "text",
        required: true,
    },
    {
        key: "age",
        label: "Age",
        type: "text",
        required: true,
    },
    {
        key: "sex",
        label: "Sex",
        type: "text",
        required: true,
    },
    {
        key: "gender",
        label: "Gender",
        type: "text",
    },
    {
        key: "species",
        label: "Species",
        type: "text",
    },
    {
        key: "jobName",
        label: "Favorite job",
        type: "autocomplete",
        autocompleteOptions: [],
        loadOptions: loadJobNameOptions,
        required: true,
        size: 12,
    },
    {
        key: "hairName",
        label: "Hair name",
        type: "text",
        hidden: true,
        required: true,
    },
    {
        key: "hairColor",
        label: "Hair color",
        type: "text",
        hidden: true,
        required: true,
    },
    {
        key: "facialHairName",
        label: "Facial hair name",
        type: "text",
        hidden: true,
        required: true,
    },
    {
        key: "facialHairColor",
        label: "Facial hair color",
        type: "text",
        hidden: true,
        required: true,
    },
    {
        key: "eyeColor",
        label: "Eye color",
        type: "text",
        hidden: true,
        required: true,
    },
    {
        key: "skinColor",
        label: "Skin color",
        type: "text",
        hidden: true,
        required: true,
    },
    {
        key: "markings",
        label: "Markings JSON",
        type: "multiline",
        hidden: true,
        required: true,
        placeholder: "{}",
        size: 12,
        formatValue: formatJsonText,
        isChanged: isJsonChanged,
        validate: async (value) => validateJsonText(value),
    },
    {
        key: "flavorText",
        label: "Flavor text",
        type: "text",
        hidden: true,
        required: true,
    },
    {
        key: "spawnPriority",
        label: "Spawn priority",
        type: "text",
        hidden: true,
        required: true,
        placeholder: 0,
    },
    {
        key: "borgName",
        label: "Borg name",
        type: "text",
        hidden: true,
        required: true,
    },
    {
        key: "height",
        label: "Height",
        type: "text",
        hidden: true,
        required: true,
        placeholder: 1,
    },
    {
        key: "width",
        label: "Width",
        type: "text",
        hidden: true,
        required: true,
        placeholder: 1,
    },
    {
        key: "voice",
        label: "Voice",
        type: "text",
        hidden: true,
        required: true,
    },
    {
        key: "bodyType",
        label: "Body type",
        type: "text",
        hidden: true,
        required: true,
    },
];

export default fields;
