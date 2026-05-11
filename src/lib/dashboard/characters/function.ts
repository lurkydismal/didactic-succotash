"use server";

import { asc, desc, eq, getColumns, sql } from "drizzle-orm";

import db from "@/db";
import { job, player, preference, profile } from "@/db/schema";
import {
    ProfileRow as TableRow,
    ProfileRowInsert as TableRowInsert,
} from "@/db/types";
import { cacheDbRequest, updateDbCacheTags } from "@/lib/cache";
import log from "@/utils/stdlog";

const idColumn = profile.profileId;
const favoriteJobPriority = 3;

type CharacterMutationInput = Partial<TableRowInsert> & {
    playerUsername?: string | null;
    jobName?: string | null;
};

type CharacterPackedOption = {
    playerUsername: string;
    charName: string;
    jobName: string;
};

type CharacterRow = TableRow & {
    id: number;
    playerUsername: string;
    jobName: string;
};

/**
 * Trims any display value from the row dialog and returns an empty string for nullish input.
 */
function normalizeDisplayValue(value: unknown): string {
    return String(value ?? "").trim();
}

/**
 * Coerces a mutation value into an integer, throwing a field-specific error when invalid.
 */
function coerceIntegerField(value: unknown, fieldName: string): number {
    const parsed = Number(value);

    if (!Number.isInteger(parsed)) {
        throw new Error(`Invalid ${fieldName}`);
    }

    return parsed;
}

/**
 * Resolves the preference id that links a character profile to the selected player username.
 */
async function resolvePreferenceIdByUsername(
    rawValue: string | null | undefined,
): Promise<number | null> {
    const username = rawValue?.trim();
    if (!username) return null;

    const [targetPreference] = await db
        .select({ preferenceId: preference.preferenceId })
        .from(preference)
        .innerJoin(player, eq(preference.userId, player.userId))
        .where(eq(player.lastSeenUserName, username))
        .limit(1)
        .execute();

    return targetPreference?.preferenceId ?? null;
}

/**
 * Calculates the next available character slot for a player's preference record.
 */
async function getNextProfileSlot(preferenceId: number): Promise<number> {
    const [slotRow] = await db
        .select({
            nextSlot: sql<number>`COALESCE(MAX(${profile.slot}), -1) + 1`,
        })
        .from(profile)
        .where(eq(profile.preferenceId, preferenceId))
        .execute();

    return Number(slotRow?.nextSlot ?? 0);
}

/**
 * Builds a complete profile insert payload with safe character defaults for non-null columns.
 */
async function buildProfileInsert(
    row: CharacterMutationInput,
    preferenceId: number,
): Promise<TableRowInsert> {
    return {
        slot:
            row.slot === undefined || row.slot === null
                ? await getNextProfileSlot(preferenceId)
                : coerceIntegerField(row.slot, "slot"),
        charName: normalizeDisplayValue(row.charName),
        age: coerceIntegerField(row.age, "age"),
        sex: normalizeDisplayValue(row.sex),
        hairName: normalizeDisplayValue(row.hairName) || "Bald",
        hairColor: normalizeDisplayValue(row.hairColor) || "#000000",
        facialHairName: normalizeDisplayValue(row.facialHairName) || "Shaved",
        facialHairColor:
            normalizeDisplayValue(row.facialHairColor) || "#000000",
        eyeColor: normalizeDisplayValue(row.eyeColor) || "#000000",
        skinColor: normalizeDisplayValue(row.skinColor) || "#ffffff",
        prefUnavailable:
            row.prefUnavailable === undefined || row.prefUnavailable === null
                ? 0
                : coerceIntegerField(row.prefUnavailable, "prefUnavailable"),
        preferenceId,
        gender: normalizeDisplayValue(row.gender),
        species: normalizeDisplayValue(row.species),
        markings: row.markings,
        flavorText: normalizeDisplayValue(row.flavorText),
        spawnPriority:
            row.spawnPriority === undefined || row.spawnPriority === null
                ? 0
                : coerceIntegerField(row.spawnPriority, "spawnPriority"),
        borgName: normalizeDisplayValue(row.borgName),
        height:
            row.height === undefined || row.height === null
                ? 1
                : (() => {
                      const parsed = Number(row.height);
                      if (!Number.isFinite(parsed))
                          throw new Error("Invalid height");
                      return parsed;
                  })(),
        width:
            row.width === undefined || row.width === null
                ? 1
                : (() => {
                      const parsed = Number(row.width);
                      if (!Number.isFinite(parsed))
                          throw new Error("Invalid width");
                      return parsed;
                  })(),
        voice: normalizeDisplayValue(row.voice),
        bodyType: normalizeDisplayValue(row.bodyType),
    };
}

/**
 * Builds a profile update payload from submitted dialog fields while preserving omitted columns.
 */
function buildProfileUpdate(
    fd: FormData,
    resolvedPreferenceId: number | null,
): Partial<TableRowInsert> {
    const update: Partial<TableRowInsert> = {};

    for (const fieldName of [
        "slot",
        "age",
        "prefUnavailable",
        "spawnPriority",
    ] as const) {
        const value = fd.get(fieldName);
        if (value !== null && value !== "") {
            update[fieldName] = coerceIntegerField(value, fieldName);
        }
    }

    for (const fieldName of ["height", "width"] as const) {
        const value = fd.get(fieldName);
        if (value !== null && value !== "") {
            const parsed = Number(value);
            if (!Number.isFinite(parsed)) {
                throw new Error(`Invalid ${fieldName}`);
            }
            update[fieldName] = parsed;
        }
    }

    for (const fieldName of [
        "charName",
        "sex",
        "hairName",
        "hairColor",
        "facialHairName",
        "facialHairColor",
        "eyeColor",
        "skinColor",
        "gender",
        "species",
        "flavorText",
        "borgName",
        "voice",
        "bodyType",
    ] as const) {
        const value = fd.get(fieldName);
        if (value !== null) {
            update[fieldName] = normalizeDisplayValue(value);
        }
    }

    if (resolvedPreferenceId !== null) {
        update.preferenceId = resolvedPreferenceId;
    }

    return update;
}

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Updates the profile's high-priority job row within an existing transaction so Favorite job maps to job.jobName.
 */
async function setFavoriteJobWithTx(
    tx: DbTransaction,
    profileId: number,
    rawJobName: unknown,
) {
    if (typeof rawJobName !== "string") {
        throw new Error("Favorite job must be a string");
    }
    
    const jobName = normalizeDisplayValue(rawJobName);

    if (!jobName) {
        throw new Error("Favorite job is required");
    }

    const [existingNamedJob] = await tx
        .select({ jobId: job.jobId })
        .from(job)
        .where(
            sql`${job.profileId} = ${profileId} AND ${job.jobName} = ${jobName}`,
        )
        .limit(1)
        .execute();

    await tx
        .update(job)
        .set({ priority: 2 })
        .where(
            sql`${job.profileId} = ${profileId} AND ${job.priority} = ${favoriteJobPriority}`,
        )
        .execute();

    if (existingNamedJob) {
        await tx
            .update(job)
            .set({ priority: favoriteJobPriority })
            .where(eq(job.jobId, existingNamedJob.jobId))
            .execute();
        return;
    }

    await tx
        .insert(job)
        .values({ profileId, jobName, priority: favoriteJobPriority })
        .execute();
}

/**
 * Updates the profile's high-priority job row so Favorite job maps to job.jobName.
 */
async function setFavoriteJob(profileId: number, rawJobName: unknown) {
    await db.transaction(async (tx) => {
        await setFavoriteJobWithTx(tx, profileId, rawJobName);
    });
}

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
    cacheDbRequest(["preference", "player"]);

    const rows = await db
        .select({ playerUsername: player.lastSeenUserName })
        .from(preference)
        .innerJoin(player, eq(preference.userId, player.userId))
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
 * Gets packed character options so selecting a player, character, or favorite job can fill sibling fields.
 */
export async function getPlayerPackedOptionsAction(): Promise<
    CharacterPackedOption[]
> {
    "use cache";
    cacheDbRequest(["profile", "preference", "player", "job"]);

    const rows = await db
        .select({
            playerUsername: player.lastSeenUserName,
            charName: profile.charName,
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
        .where(sql`${player.lastSeenUserName} <> ''`)
        .orderBy(asc(player.lastSeenUserName), asc(profile.charName))
        .execute();

    return rows.map((row) => ({
        playerUsername: row.playerUsername.trim(),
        charName: row.charName.trim(),
        jobName: row.jobName.trim(),
    }));
}

/**
 * Creates a character profile and stores Favorite job in the related job table.
 */
export async function createRowAction(
    row: CharacterMutationInput,
): Promise<void> {
    const preferenceId = await resolvePreferenceIdByUsername(
        row.playerUsername,
    );
    if (!preferenceId) {
        throw new Error("Invalid player username");
    }

    if (!normalizeDisplayValue(row.charName)) {
        throw new Error("Character name is required");
    }

    try {
        await db.transaction(async (tx) => {
            const profileInsert = await buildProfileInsert(row, preferenceId);
            const [createdProfile] = await tx
                .insert(profile)
                .values(profileInsert)
                .returning({ profileId: profile.profileId })
                .execute();

            if (!createdProfile) {
                throw new Error("Profile insert did not return an id");
            }

            await setFavoriteJobWithTx(
                tx,
                createdProfile.profileId,
                row.jobName,
            );
        });

        updateDbCacheTags(["profile", "job"]);
    } catch (error) {
        log.error("Create character error:", error);
        throw error;
    }
}

/**
 * Updates a character profile and syncs Favorite job through job.profileId.
 */
export async function updateRowAction(fd: FormData): Promise<void> {
    const profileId = coerceIntegerField(fd.get("id"), "id");
    const playerUsername = normalizeDisplayValue(fd.get("playerUsername"));
    const resolvedPreferenceId =
        await resolvePreferenceIdByUsername(playerUsername);

    if (playerUsername && !resolvedPreferenceId) {
        throw new Error("Invalid player username");
    }

    const favoriteJobName = fd.get("jobName");

    const profileUpdate = buildProfileUpdate(fd, resolvedPreferenceId);

    try {
        const updateResult = await db
            .update(profile)
            .set(profileUpdate)
            .where(eq(profile.profileId, profileId))
            .execute();

        const affectedRows =
            typeof (updateResult as { rowCount?: number }).rowCount === "number"
                ? (updateResult as { rowCount: number }).rowCount
                : Array.isArray(updateResult)
                  ? updateResult.length
                  : undefined;

        if (affectedRows === 0) {
            throw new Error("Update target no longer exists");
        }

        await setFavoriteJob(profileId, favoriteJobName);
        updateDbCacheTags(["profile", "job"]);
    } catch (error) {
        log.error("Update character error:", error);
        throw error;
    }
}
