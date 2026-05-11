import type { FieldConfig } from "@/components/TableDataGrid/RowDialog";
import type {
    AdminLogRow as TableRow,
    AdminLogRowInsert as TableRowInsert,
} from "@/db/types";
import {
    getServerNameByRoundIdAction,
    hasRoundIdAction,
} from "@/lib/dashboard/logs/function";

/**
 * Parses a field value as an integer round ID.
 */
function parseRoundId(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;

    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : null;
}

/**
 * Resolves dependent log fields from the current round ID field value.
 */
async function resolveRoundDependentFields(value: unknown) {
    const roundId = parseRoundId(value);
    if (roundId === null) return { serverName: "" };

    const serverName = await getServerNameByRoundIdAction(roundId);
    return serverName ? { serverName } : { serverName: "" };
}

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
        key: "roundId",
        label: "Round ID",
        type: "text",
        required: true,
        runOnDialogOpen: true,
        onValueChange: resolveRoundDependentFields,
        /**
         * Validates that the referenced round exists.
         */
        validate: async (value) => {
            if (value === null || value === undefined || value === "") {
                return true;
            }

            const parsed = parseRoundId(value);
            if (parsed === null) {
                return "No such ID";
            }

            try {
                const exists = await hasRoundIdAction(parsed);
                return exists || "No such ID";
            } catch {
                return "Unable to verify round ID";
            }
        },
    },
    {
        key: "serverName",
        label: "Server",
        type: "text",
        required: true,
        readOnly: true,
    },
    {
        key: "impact",
        label: "Severity",
        type: "text",
        required: true,
        placeholder: 0,
        validate: async (value) => {
            const parsed = Number(value);
            return Number.isInteger(parsed) || "Severity must be an integer";
        },
    },
    {
        key: "date",
        label: "Date",
        type: "datetime",
        required: true,
        placeholder: new Date(),
    },
    {
        key: "type",
        label: "Type",
        type: "text",
        required: true,
        validate: async (value) => {
            const parsed = Number(value);
            return Number.isInteger(parsed) || "Type must be an integer";
        },
    },
    {
        key: "message",
        label: "Message",
        type: "multiline",
        required: true,
        size: 12,
    },
    {
        key: "json",
        label: "JSON",
        type: "multiline",
        required: true,
        placeholder: "{}",
        size: 12,
        formatValue: formatJsonText,
        isChanged: isJsonChanged,
        validate: async (value) => validateJsonText(value),
    },
];

export default fields;
