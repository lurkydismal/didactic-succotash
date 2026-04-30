import TableDataGrid from "@/components/TableDataGrid";
import {
    ServerBanRow as TableRow,
    ServerBanRowInsert as TableRowInsert,
} from "@/db/types";
import ExtraToolbarButtons from "@/components/dashboard/ExtraToolbarButtons";
import fields from "@/data/dashboard/bans/fields";
import { makeCrudActions } from "@/lib/dashboard/common/actions";
import { serverBan } from "@/db/schema";

export default async function Page() {
    return <div></div>;
    // const { getRowsAction, createRowAction, updateRowAction } = await makeCrudActions<
    //     TableRowInsert
    // >("table", serverBan.serverBanId);

    // const emptyRow: TableRowInsert = {
    //     serverBanId: 1,
    //     address: "123",
    //     reason: "-",
    //     banTime: new Date(),
    // };

    // return (
    //     <TableDataGrid<TableRow, TableRowInsert>
    //         createRowAction={createRowAction}
    //         emptyRow={emptyRow}
    //         fields={fields}
    //         getRowsAction={getRowsAction}
    //         updateRowAction={updateRowAction}
    //         extraButtons={
    //             <ExtraToolbarButtons
    //                 emptyRow={emptyRow}
    //                 createRowAction={createRowAction}
    //             />
    //         }
    //     />
    // );
}
