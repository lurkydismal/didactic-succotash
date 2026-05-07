import type { FieldConfig } from "@/components/TableDataGrid/RowDialog";
import type { AutocompleteOption } from "@/components/TableDataGrid/RowDialog/types";
import type {
    ServerBanRow as TableRow,
    ServerBanRowInsert as TableRowInsert,
} from "@/db/types";
import {
    getPlayerPackedOptionsAction,
    getPlayerUsernameOptionsAction,
    hasRoundIdAction,
} from "@/lib/dashboard/bans/function";
import { formatHwidByteaHex, formatHwidHex } from "@/utils/hwid";

const packedFieldNames = ["playerUsername", "address", "hwid"] as const;

type PackedPlayerField = (typeof packedFieldNames)[number];
type PackedPlayerRow = Record<PackedPlayerField, string>;

let packedPlayerRowsPromise: Promise<PackedPlayerRow[]> | null = null;
let playerUsernameOptionsPromise: Promise<string[]> | null = null;

/**
 * Loads packed player rows once so multiple autocomplete fields can share them.
 */
const loadPackedPlayerRows = () => {
    packedPlayerRowsPromise ??= getPlayerPackedOptionsAction();
    return packedPlayerRowsPromise;
};

/**
 * Loads player username options once for admin selection.
 */
const loadPlayerUsernameOptions = () => {
    playerUsernameOptionsPromise ??= getPlayerUsernameOptionsAction();
    return playerUsernameOptionsPromise;
};

/**
 * Builds packed autocomplete options for the selected player field.
 */
const loadPackedPlayerOptions =
    (labelKey: PackedPlayerField) =>
    async (): Promise<AutocompleteOption[]> => {
        const packedRows = await loadPackedPlayerRows();

        return packedRows.reduce<AutocompleteOption[]>((options, packedRow) => {
            const label = packedRow[labelKey];
            if (!label) return options;

            const packedValues = packedFieldNames.reduce<
                Record<string, unknown>
            >((values, packedField) => {
                values[packedField] = packedRow[packedField] ?? "";
                return values;
            }, {});

            options.push({ label, packedValues });
            return options;
        }, []);
    };

const fields: FieldConfig<TableRow, TableRowInsert>[] = [
    {
        key: "playerUsername",
        label: "Player",
        type: "autocomplete",
        autocompleteOptions: [],
        loadOptions: loadPackedPlayerOptions("playerUsername"),
        requiredGroup: "banTarget",
    },
    {
        key: "address",
        label: "Address",
        type: "autocomplete",
        autocompleteOptions: [],
        loadOptions: loadPackedPlayerOptions("address"),
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
        loadOptions: loadPlayerUsernameOptions,
        required: true,
    },
    {
        key: "hwid",
        label: "HWID",
        type: "autocomplete",
        autocompleteOptions: [],
        loadOptions: loadPackedPlayerOptions("hwid"),
        formatValue: formatHwidHex,
        requiredGroup: "banTarget",
        toFormValue: formatHwidByteaHex,
    },
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

            const exists = await hasRoundIdAction(parsed);
            return exists || "No such ID";
        },
    },
];

export default fields;
