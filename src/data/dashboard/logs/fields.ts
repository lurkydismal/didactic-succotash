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
    // {
    //     key: "roundId",
    //     label: "Server",
    //     type: "text",
    // },
    {
        key: "impact",
        label: "Severity",
        type: "text",
        required: true,
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
