"use server";

import { ServerBanRow, ServerBanRowInsert } from "@/db/types";
import { makeCrudActions } from "@/lib/dashboard/common/actions";
import { BANS_CRUD_CONFIG } from "@/lib/dashboard/common/config";

export const { _getRowsAction, createRowAction, updateRowAction } =
    await makeCrudActions<ServerBanRow, ServerBanRowInsert>(BANS_CRUD_CONFIG);
