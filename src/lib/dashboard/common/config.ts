import { DbTarget } from "@/lib/types";

export type CrudConfig = {
    target: DbTarget;
};

export const TABLE_CRUD_CONFIG: CrudConfig = {
    target: "table",
};

export const BANS_CRUD_CONFIG: CrudConfig = {
    target: "serverBan",
};

export function getCrudConfigByTarget(target: DbTarget): CrudConfig {
    if (target === "table") {
        return TABLE_CRUD_CONFIG;
    }

    if (target === "serverBan") {
        return BANS_CRUD_CONFIG;
    }

    throw new Error(`Unsupported target ${target}`);
}
