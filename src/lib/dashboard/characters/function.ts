"use server";

import { asc, desc, eq, getColumns, sql } from "drizzle-orm";

import db from "@/db";
import { job, player, preference, profile } from "@/db/schema";
import { ProfileRow as TableRow } from "@/db/types";
import { cacheDbRequest } from "@/lib/cache";

const idColumn = profile.profileId;
const favoriteJobPriority = 3;
type CharacterRow = TableRow & {
    id: number;
    playerUsername: string;
    jobName: string;
};

/**
 * Gets character profile rows with their owning player and favorite job display values.
 */
export async function getRowsAction(): Promise<CharacterRow[]> {
    "use cache";
    cacheDbRequest(["profile", "preference", "player", "job"]);

    const profileColumns = getColumns(profile);
    const rows = await db
        .select({
            ...profileColumns,
            id: profile.profileId,
            playerUsername: player.lastSeenUserName,
            jobName: sql<string>`COALESCE(${job.jobName}, '')`,
        })
        .from(profile)
        .innerJoin(
            preference,
            eq(profile.preferenceId, preference.preferenceId),
        )
        .innerJoin(player, eq(preference.userId, player.userId))
        .leftJoin(
            job,
            sql`${job.profileId} = ${profile.profileId} AND ${job.priority} = ${favoriteJobPriority}`,
        )
        .orderBy(desc(idColumn))
        .execute();

    return rows;
}

/**
 * Gets player username options that can be attached to character profiles.
 */
export async function getPlayerUsernameOptionsAction(): Promise<string[]> {
    "use cache";
    cacheDbRequest(["player"]);

    const rows = await db
        .select({ playerUsername: player.lastSeenUserName })
        .from(player)
        .where(sql`${player.lastSeenUserName} <> ''`)
        .orderBy(asc(player.lastSeenUserName))
        .execute();

    return [
        ...new Set(
            rows.map((row) => row.playerUsername.trim()).filter(Boolean),
        ),
    ];
}

/**
 * Gets distinct job names from every job table row for Favorite job autocomplete options.
 */
export async function getJobNameOptionsAction(): Promise<string[]> {
    "use cache";
    cacheDbRequest(["job"]);

    const rows = await db
        .select({ jobName: job.jobName })
        .from(job)
        .where(sql`trim(${job.jobName}) <> ''`)
        .groupBy(job.jobName)
        .orderBy(asc(job.jobName))
        .execute();

    return [...new Set(rows.map((row) => row.jobName.trim()).filter(Boolean))];
}
