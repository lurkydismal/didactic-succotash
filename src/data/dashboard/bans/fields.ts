import { FieldConfig } from "@/components/TableDataGrid/RowDialog";
import { formatHwidHex } from "@/utils/hwid";
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
        autocompletePackedKey: "playerUsername",
        autocompletePackedFields: ["playerUsername", "address", "hwid"],
        requiredGroup: "banTarget",
    },
    {
        key: "address",
        label: "Address",
        type: "autocomplete",
        autocompleteOptions: [],
        autocompletePackedKey: "address",
        autocompletePackedFields: ["playerUsername", "address", "hwid"],
        requiredGroup: "banTarget",
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
        placeholder: null,
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
        required: true,
    },
    {
        key: "hwid",
        label: "HWID",
        type: "autocomplete",
        autocompleteOptions: [],
        autocompletePackedKey: "hwid",
        autocompletePackedFields: ["playerUsername", "address", "hwid"],
        formatValue: formatHwidHex,
        requiredGroup: "banTarget",
    },
    {
        key: "roundId",
        label: "Round ID",
        type: "text",
        required: true,
    },
];

export default fields;
