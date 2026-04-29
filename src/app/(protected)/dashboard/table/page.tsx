import TableDataGrid from "@/components/TableDataGrid";
import { TableRow, TableRowInsert } from "@/db/types";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import fields from "@/data/dashboard/table/fields";
import { makeCrudActions } from "@/lib/dashboard/common/actions";
import { table } from "@/db/schema";

export default async function Page() {
    const { getRowsAction, createRowAction, updateRowAction } = await makeCrudActions<
        TableRowInsert
    >("table", table.id);

    const emptyRow: TableRowInsert = {
        content: "-",
    };

    return (
        <TableDataGrid<TableRow, TableRowInsert>
            createRowAction={createRowAction}
            emptyRow={emptyRow}
            fields={fields}
            getRowsAction={getRowsAction}
            updateRowAction={updateRowAction}
            extraButtons={
                <ExtraToolbarButtons
                    emptyRow={emptyRow}
                    createRowAction={createRowAction}
                />
            }
        />
    );
}
