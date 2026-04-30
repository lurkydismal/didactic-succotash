import { FieldConfig } from "@/components/TableDataGrid/RowDialog";
import {
    ServerBanRow as TableRow,
    ServerBanRowInsert as TableRowInsert,
} from "@/db/types";

// TODO: Also derive empty row from this
const fields: FieldConfig<TableRow, TableRowInsert>[] = [
    {
        key: "playerUserId",
        label: "Player",
        type: "text",
        size: 12,
    },
    {
        key: "address",
        label: "Address",
        type: "text",
        size: 12,
        required: true,
    },
    {
        key: "banTime",
        label: "Ban time",
        type: "text",
        size: 12,
        required: true,
    },
    {
        key: "expirationTime",
        label: "Expiration time",
        type: "text",
        size: 12,
    },
    {
        key: "reason",
        label: "Reason",
        type: "text",
        size: 12,
        required: true,
    },
    {
        key: "banningAdmin",
        label: "Banning admin",
        type: "text",
        size: 12,
    },
    {
        key: "hwid",
        label: "HWID",
        type: "text",
        size: 12,
    },
    {
        key: "roundId",
        label: "Round ID",
        type: "text",
        size: 12,
    },
];

export default fields;