import { FieldConfig } from "@/components/TableDataGrid/RowDialog";
import {
    ServerBanRow as TableRow,
    ServerBanRowInsert as TableRowInsert,
} from "@/db/types";

const fields: FieldConfig<TableRow, TableRowInsert>[] = [
    {
        key: "playerUsername",
        label: "Player",
        type: "autocomplete",
        placeholder: "",
        autocompleteOptions: [],
    },
    {
        key: "address",
        label: "Address",
        type: "text",
        required: true,
    },
    {
        key: "banTime",
        label: "Ban time",
        type: "text",
        required: true,
        placeholder: new Date(),
    },
    {
        key: "expirationTime",
        label: "Expiration time",
        type: "text",
    },
    {
        key: "reason",
        label: "Reason",
        type: "multiline",
        required: true,
    },
    {
        key: "banningAdmin",
        label: "Banning admin",
        type: "text",
    },
    {
        key: "hwid",
        label: "HWID",
        type: "text",
    },
    {
        key: "roundId",
        label: "Round ID",
        type: "text",
    },
];

export default fields;
