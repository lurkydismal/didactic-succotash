"use server";

import db from "@/db";
import { player, serverBan } from "@/db/schema";
import { ServerBanRowInsert as TableRowInsert } from "@/db/types";
import { create } from "@/lib/dashboard/common/create";
import { updateAction } from "@/lib/dashboard/common/update";
import { DbTarget } from "@/lib/types";
import log from "@/utils/stdlog";
import { eq, sql } from "drizzle-orm";

const target: DbTarget = "serverBan";
const idColumn = serverBan.serverBanId;

type ServerBanMutationInput = TableRowInsert & { playerUsername?: string };

export async function getRowsAction() {
    const rows = await db
        .select({
            ...serverBan,
            id: serverBan.serverBanId,
            playerUsername: player.lastSeenUserName,
        })
        .from(serverBan)
        .leftJoin(player, eq(serverBan.playerUserId, player.userId))
        .orderBy(sql`${idColumn} desc`)
        .execute();

    return rows;
}

export async function getPlayerUsernameOptionsAction(): Promise<string[]> {
    const rows = await db
        .select({ playerUsername: player.lastSeenUserName })
        .from(player)
        .where(sql`${player.lastSeenUserName} <> ''`)
        .orderBy(sql`${player.lastSeenUserName} asc`)
        .execute();

    return [...new Set(rows.map((row) => row.playerUsername.trim()).filter(Boolean))];
}

export async function createRowAction(
    row: ServerBanMutationInput,
): Promise<void> {
    const username = row.playerUsername?.trim();

    if (username) {
        const targetPlayer = await db.query.player.findFirst({
            where: eq(player.lastSeenUserName, username),
            columns: { userId: true },
        });
        row.playerUserId = targetPlayer?.userId ?? null;
    } else {
        const randomPlayer = await db.query.player.findFirst({
            where: sql`${player.lastSeenUserName} <> ''`,
            columns: { userId: true, lastSeenUserName: true },
            orderBy: sql`random()`,
        });

        if (!randomPlayer?.userId || !randomPlayer.lastSeenUserName) {
            log.error("Create server ban aborted: no available username found");
            throw new Error("No available username found for ban creation");
        }

        row.playerUserId = randomPlayer.userId;
    }

    delete row.playerUsername;
    const result = await create(target, row);
    if (!result.ok) throw new Error(`Failed to create row in action: ${result.error}`);
}

export async function updateRowAction(
    fd: FormData,
): Promise<void> {
    const username = `${fd.get("playerUsername") ?? ""}`.trim();
    if (username) {
        const targetPlayer = await db.query.player.findFirst({
            where: eq(player.lastSeenUserName, username),
            columns: { userId: true },
        });
        fd.set("playerUserId", targetPlayer?.userId ?? "");
    } else {
        fd.set("playerUserId", "");
    }
    fd.delete("playerUsername");

    const result = await updateAction(target, idColumn, fd);
    if (!result.ok) throw new Error(`Failed to update row in action: ${result.error}`);
}
