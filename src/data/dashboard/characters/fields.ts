import type { FieldConfig } from "@/components/TableDataGrid/RowDialog";
import type { AutocompleteOption } from "@/components/TableDataGrid/RowDialog/types";
import type {
    ProfileRow as TableRow,
    ProfileRowInsert as TableRowInsert,
} from "@/db/types";
import {
    getJobNameOptionsAction,
    getPlayerPackedOptionsAction,
    getPlayerUsernameOptionsAction,
} from "@/lib/dashboard/characters/function";

const packedFieldNames = ["playerUsername", "jobName"] as const;

type PackedPlayerField = (typeof packedFieldNames)[number];

/**
 * Loads packed player rows once so multiple autocomplete fields can share them.
 */
const loadPackedPlayerRows = () => {
    return getPlayerPackedOptionsAction();
};

/**
 * Loads player username options once for character ownership selection.
 */
const loadPlayerUsernameOptions = () => {
    return getPlayerUsernameOptionsAction();
};

/**
 * Loads distinct job names from the job table for Favorite job selection.
 */
const loadJobNameOptions = () => {
    return getJobNameOptionsAction();
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
        loadOptions: loadPlayerUsernameOptions,
        required: true,
    },
    {
        key: "charName",
        label: "Character name",
        type: "text",
        required: true,
    },
    {
        key: "age",
        label: "Age",
        type: "text",
        required: true,
    },
    {
        key: "sex",
        label: "Sex",
        type: "text",
        required: true,
    },
    {
        key: "gender",
        label: "Gender",
        type: "text",
    },
    {
        key: "species",
        label: "Species",
        type: "text",
    },
    {
        key: "jobName",
        label: "Favorite job",
        type: "autocomplete",
        autocompleteOptions: [],
        loadOptions: loadJobNameOptions,
        required: true,
    },
];

export default fields;
