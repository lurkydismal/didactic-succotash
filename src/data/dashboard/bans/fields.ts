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
        autocompleteOptions: [],
        required: true,
    },
    {
        key: "address",
        label: "Address",
        type: "autocomplete",
        autocompleteOptions: [],
        required: true,
    },
    {
        key: "banTime",
        label: "Ban time",
        type: "datetime",
        required: true,
        placeholder: new Date(),
    },
    {
        key: "expirationTime",
        label: "Expiration time",
        type: "datetime",
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
        type: "autocomplete",
        autocompleteOptions: [],
    },
    {
        key: "hwid",
        label: "HWID",
        type: "autocomplete",
        autocompleteOptions: [],
    },
    {
        key: "roundId",
        label: "Round ID",
        type: "text",
    },
];

export default fields;
