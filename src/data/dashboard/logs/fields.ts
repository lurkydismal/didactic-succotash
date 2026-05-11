import type { FieldConfig } from "@/components/TableDataGrid/RowDialog";
import type {
    AdminLogRow as TableRow,
    AdminLogRowInsert as TableRowInsert,
} from "@/db/types";
import { hasRoundIdAction } from "@/lib/dashboard/logs/function";

const fields: FieldConfig<TableRow, TableRowInsert>[] = [
    {
        key: "roundId",
        label: "Round ID",
        type: "text",
        required: true,
        /**
         * Validates that the referenced round exists.
         */
        validate: async (value) => {
            if (value === null || value === undefined || value === "") {
                return true;
            }

            const parsed = Number(value);
            if (!Number.isInteger(parsed)) {
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
];

export default fields;
