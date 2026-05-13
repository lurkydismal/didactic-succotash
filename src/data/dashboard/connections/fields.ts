import type { FieldConfig } from "@/components/TableDataGrid";
import type { AutocompleteOption } from "@/components/TableDataGrid/types";
import type {
    ConnectionLogRow as TableRow,
    ConnectionLogRowInsert as TableRowInsert,
} from "@/db/types";
import {
    getPlayerPackedOptionsAction,
    getServerNameOptionsAction,
    hasServerIdAction,
} from "@/lib/dashboard/connections/function";
import { formatHwidByteaHex, formatHwidHex } from "@/utils/hwid";

const packedFieldNames = ["userName", "userId", "address", "hwid"] as const;

type PackedPlayerField = (typeof packedFieldNames)[number];

/**
 * Loads packed player rows once so multiple autocomplete fields can share them.
 */
const loadPackedPlayerRows = () => {
    return getPlayerPackedOptionsAction();
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
        key: "userName",
        label: "User name",
        type: "autocomplete",
        autocompleteOptions: [],
        loadOptions: loadPackedPlayerOptions("userName"),
        required: true,
    },
    {
        key: "userId",
        label: "User ID",
        type: "autocomplete",
        autocompleteOptions: [],
        loadOptions: loadPackedPlayerOptions("userId"),
        required: true,
    },
    {
        key: "time",
        label: "Time",
        type: "datetime",
        placeholder: new Date(),
        required: true,
    },
    {
        key: "address",
        label: "IP address",
        type: "autocomplete",
        autocompleteOptions: [],
        loadOptions: loadPackedPlayerOptions("address"),
        required: true,
    },
    {
        key: "hwid",
        label: "HWID",
        type: "autocomplete",
        autocompleteOptions: [],
        loadOptions: loadPackedPlayerOptions("hwid"),
        formatValue: formatHwidHex,
        toFormValue: formatHwidByteaHex,
    },
    {
        key: "denied",
        label: "Status",
        type: "text",
    },
    {
        key: "serverId",
        label: "Server",
        type: "autocomplete",
        autocompleteOptions: [],
        loadOptions: getServerNameOptionsAction,
        required: true,
        /**
         * Validates that the referenced round exists.
         */
        validate: async (value) => {
            if (value === null || value === undefined || value === "") {
                return true;
            }

            const parsed = String(value);
            if (!parsed) {
                return "No such server";
            }

            try {
                const exists = await hasServerIdAction(parsed);
                return exists || "No such server";
            } catch {
                return "Unable to verify server";
            }
        },
    },
    {
        key: "trust",
        label: "Trust score",
        type: "text",
        placeholder: 0,
        required: true,
    },
];

export default fields;
