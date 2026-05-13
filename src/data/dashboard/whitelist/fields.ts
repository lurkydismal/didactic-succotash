import type { FieldConfig } from "@/components/TableDataGrid";
import type { AutocompleteOption } from "@/components/TableDataGrid/types";
import type {
    WhitelistRow as TableRow,
    WhitelistRowInsert as TableRowInsert,
} from "@/db/types";
import { getPlayerPackedOptionsAction } from "@/lib/dashboard/whitelist/function";

const packedFieldNames = ["userName", "userId"] as const;

type PackedPlayerField = (typeof packedFieldNames)[number];

/**
 * Loads packed player rows once so all whitelist autocomplete fields share one request.
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
        label: "Name",
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
];

export default fields;
