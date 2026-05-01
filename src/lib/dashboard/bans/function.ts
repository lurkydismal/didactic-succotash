"use server";

import db from "@/db";
import { player, serverBan } from "@/db/schema";
import { ServerBanRowInsert as TableRowInsert } from "@/db/types";
import { create } from "@/lib/dashboard/common/create";
import { updateAction } from "@/lib/dashboard/common/update";
import { DbTarget } from "@/lib/types";
import log from "@/utils/stdlog";
import { asc, desc, eq, getColumns, ne, sql } from "drizzle-orm";

const target: DbTarget = "serverBan";
const idColumn = serverBan.serverBanId;

type ServerBanMutationInput = TableRowInsert & { playerUsername?: string };

export async function getRowsAction() {
    const serverBanColumns = getColumns(serverBan);
    const rows = await db
        .select({
            ...serverBanColumns,
            id: serverBan.serverBanId,
            playerUsername: player.lastSeenUserName,
        })
        .from(serverBan)
        .leftJoin(player, eq(serverBan.playerUserId, player.userId))
        .orderBy(desc(idColumn))
        .execute();

    return rows;
}

export async function getPlayerUsernameOptionsAction(): Promise<string[]> {
    const rows = await db
        .select({ playerUsername: player.lastSeenUserName })
        .from(player)
        .where(ne(player.lastSeenUserName, ""))
        .orderBy(asc(player.lastSeenUserName))
        .execute();

    return [
        ...new Set(
            rows.map((row) => row.playerUsername.trim()).filter(Boolean),
        ),
    ];
}

export async function getPlayerAddressOptionsAction(): Promise<string[]> {
    const rows = await db
        .select({ address: player.lastSeenAddress })
        .from(player)
        .where(sql`${player.lastSeenAddress} IS NOT NULL`)
        .orderBy(asc(player.lastSeenAddress))
        .execute();

    return [
        ...new Set(
            rows
                .map((row) => (row.address ? row.address.trim() : ""))
                .filter(Boolean),
        ),
    ];
}

export async function getPlayerHwidOptionsAction(): Promise<string[]> {
    const rows = await db
        .select({ hwid: player.lastSeenHwid })
        .from(player)
        .where(sql`${player.lastSeenHwid} IS NOT NULL`)
        .orderBy(asc(player.lastSeenHwid))
        .execute();

    return [
        ...new Set(
            rows
                .map((row) =>
                    row.hwid ? Buffer.from(String(row.hwid)).toString("hex") : "",
                )
                .filter(Boolean),
        ),
    ];
}

export async function createRowAction(
    row: ServerBanMutationInput,
): Promise<void> {
    const username = row.playerUsername?.trim();

    if (username) {
        const [targetPlayer] = await db
            .select({ userId: player.userId })
            .from(player)
            .where(eq(player.lastSeenUserName, username))
            .limit(1)
            .execute();
        row.playerUserId = targetPlayer?.userId ?? null;
    } else {
        const [randomPlayer] = await db
            .select({
                userId: player.userId,
                lastSeenUserName: player.lastSeenUserName,
            })
            .from(player)
            .where(ne(player.lastSeenUserName, ""))
            .orderBy(sql`random()`)
            .limit(1)
            .execute();

        if (!randomPlayer?.userId || !randomPlayer.lastSeenUserName) {
            log.error("Create server ban aborted: no available username found");
            throw new Error("No available username found for ban creation");
        }

        row.playerUserId = randomPlayer.userId;
    }

    delete row.playerUsername;
    const result = await create(target, row);
    if (!result.ok)
        throw new Error(`Failed to create row in action: ${result.error}`);
}

export async function updateRowAction(fd: FormData): Promise<void> {
    const username = `${fd.get("playerUsername") ?? ""}`.trim();
    if (username) {
        const [targetPlayer] = await db
            .select({ userId: player.userId })
            .from(player)
            .where(eq(player.lastSeenUserName, username))
            .limit(1)
            .execute();
        fd.set("playerUserId", targetPlayer?.userId ?? "");
    } else {
        fd.set("playerUserId", "");
    }
    fd.delete("playerUsername");

    const result = await updateAction(target, idColumn, fd);
    if (!result.ok)
        throw new Error(`Failed to update row in action: ${result.error}`);
}
