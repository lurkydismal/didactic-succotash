import { FieldConfig } from "@/components/TableDataGrid/RowDialog";
import {
    ServerBanRow as TableRow,
    ServerBanRowInsert as TableRowInsert,
} from "@/db/types";

// TODO: Also derive empty row from this
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
