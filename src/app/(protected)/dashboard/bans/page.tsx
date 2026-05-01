"use client";

import TableDataGrid from "@/components/TableDataGrid";
import {
    ServerBanRow as TableRow,
    ServerBanRowInsert as TableRowInsert,
} from "@/db/types";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import fields from "@/data/dashboard/bans/fields";
import {
    createRowAction,
    getPlayerAddressOptionsAction,
    getPlayerHwidOptionsAction,
    getPlayerPackedOptionsAction,
    getRowsAction,
    getPlayerUsernameOptionsAction,
    hasRoundIdAction,
    updateRowAction,
} from "@/lib/dashboard/bans/function";
import { FieldConfig } from "@/components/TableDataGrid/RowDialog";
import { useEffect, useState } from "react";
import MainFallback from "@/components/MainFallback";
import { AutocompleteOption } from "@/components/TableDataGrid/RowDialog/types";

export default function Page() {
    const [resolvedFields, setResolvedFields] =
        useState<FieldConfig<TableRow, TableRowInsert>[]>(fields);
    const [playerOptionsCount, setPlayerOptionsCount] = useState<number | null>(
        null,
    );

    useEffect(() => {
        const loadPlayerOptions = async () => {
            const [
                usernameOptions,
                addressOptions,
                hwidOptions,
                packedOptions,
            ] = await Promise.all([
                getPlayerUsernameOptionsAction(),
                getPlayerAddressOptionsAction(),
                getPlayerHwidOptionsAction(),
                getPlayerPackedOptionsAction(),
            ]);
            setPlayerOptionsCount(
                usernameOptions.length +
                    addressOptions.length +
                    hwidOptions.length,
            );

            setResolvedFields((prev) =>
                prev.map((field) => {
                    if (field.autocompletePackedKey) {
                        const packedFieldNames =
                            field.autocompletePackedFields ?? [
                                field.autocompletePackedKey,
                            ];
                        const options: AutocompleteOption[] = packedOptions
                            .map((packedRow) => {
                                const labelValue =
                                    packedRow[
                                        field.autocompletePackedKey as keyof typeof packedRow
                                    ];
                                if (!labelValue) return null;

                                const packedValues = packedFieldNames.reduce<
                                    Record<string, unknown>
                                >((acc, packedField) => {
                                    acc[packedField] =
                                        packedRow[
                                            packedField as keyof typeof packedRow
                                        ] ?? "";
                                    return acc;
                                }, {});

                                return { label: labelValue, packedValues };
                            })
                            .filter(
                                (
                                    option,
                                ): option is {
                                    label: string;
                                    packedValues: Record<string, unknown>;
                                } => option !== null,
                            );

                        return { ...field, autocompleteOptions: options };
                    }

                    if (field.key === "banningAdmin") {
                        return {
                            ...field,
                            autocompleteOptions: usernameOptions,
                        };
                    }

                    if (field.key === "address") {
                        return {
                            ...field,
                            autocompleteOptions: addressOptions,
                        };
                    }

                    if (field.key === "hwid") {
                        return { ...field, autocompleteOptions: hwidOptions };
                    }

                    return field;
                }),
            );

            setResolvedFields((prev) =>
                prev.map((field) =>
                    field.key === "roundId"
                        ? {
                              ...field,
                              validate: async (value) => {
                                  if (
                                      value === null ||
                                      value === undefined ||
                                      value === ""
                                  ) {
                                      return true;
                                  }

                                  const parsed = Number(value);
                                  if (!Number.isInteger(parsed)) {
                                      return "No such ID";
                                  }

                                  const exists = await hasRoundIdAction(parsed);
                                  return exists || "No such ID";
                              },
                          }
                        : field,
                ),
            );
        };

        void loadPlayerOptions();
    }, []);

    return (
        <>
            <MainFallback itemsLength={playerOptionsCount}>
                <TableDataGrid<TableRow, TableRowInsert>
                    createRowAction={createRowAction}
                    fields={resolvedFields}
                    getRowsAction={getRowsAction}
                    updateRowAction={updateRowAction}
                    extraButtons={
                        <ExtraToolbarButtons
                            createRowAction={createRowAction}
                        />
                    }
                />
            </MainFallback>
        </>
    );
}
