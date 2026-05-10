import type { FieldConfig } from "@/components/TableDataGrid/RowDialog";
import type {
    PlayerRow as TableRow,
    PlayerRowInsert as TableRowInsert,
} from "@/db/types";
import { formatHwidByteaHex, formatHwidHex } from "@/utils/hwid";

const fields: FieldConfig<TableRow, TableRowInsert>[] = [
    {
        key: "lastSeenUserName",
        label: "Last name",
        type: "text",
        required: true,
    },
    {
        key: "userId",
        label: "User ID",
        type: "text",
        required: true,
    },
    {
        key: "lastSeenTime",
        label: "Last seen time",
        type: "datetime",
        placeholder: new Date(),
        required: true,
    },
    {
        key: "lastSeenAddress",
        label: "Last seen address",
        type: "text",
        required: true,
    },
    {
        key: "lastSeenHwid",
        label: "Last seen HWID",
        type: "text",
        formatValue: formatHwidHex,
        toFormValue: formatHwidByteaHex,
    },
    {
        key: "firstSeenTime",
        label: "First seen",
        type: "datetime",
        placeholder: new Date(),
        required: true,
    },
];

export default fields;
