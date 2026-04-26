import { FieldConfig } from "@/components/TableDataGrid/RowDialog";
import { ServerBanRow as TableRow, ServerBanRowInsert as TableRowInsert } from "@/db/types";

// simple fields for your schema (content is the only editable column)
const fields: FieldConfig<TableRow, TableRowInsert>[] = [
    {
        key: "address",
        label: "Address",
        type: "text",
        size: 12,
        required: true,
    },
];

export default fields;
