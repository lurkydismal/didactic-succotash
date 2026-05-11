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

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const maxProfileInsertAttempts = 3;
const maxFavoriteJobAttempts = 3;

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
 * Calculates the next available character slot for a player's preference record inside an existing transaction.
 */
async function getNextProfileSlot(
    tx: DbTransaction,
    preferenceId: number,
): Promise<number> {
    await tx
        .select({ preferenceId: profile.preferenceId })
        .from(profile)
        .where(eq(profile.preferenceId, preferenceId))
        .for("update")
        .execute();

    const [slotRow] = await tx
        .select({
            nextSlot: sql<number>`COALESCE(MAX(${profile.slot}), -1) + 1`,
        })
        .from(profile)
        .where(eq(profile.preferenceId, preferenceId))
        .execute();

    return Number(slotRow?.nextSlot ?? 0);
}

/**
 * Normalizes the profile markings payload so JSON strings from FormData and raw insert values use the same shape.
 */
function normalizeProfileMarkings(
    value: CharacterMutationInput["markings"],
): TableRowInsert["markings"] {
    if (typeof value !== "string") {
        return value;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    try {
        return JSON.parse(trimmed) as TableRowInsert["markings"];
    } catch {
        return value;
    }
}

/**
 * Builds a complete profile insert payload with safe character defaults for non-null columns.
 */
async function buildProfileInsert(
    tx: DbTransaction,
    row: CharacterMutationInput,
    preferenceId: number,
): Promise<TableRowInsert> {
    return {
        slot:
            row.slot === undefined || row.slot === null
                ? await getNextProfileSlot(tx, preferenceId)
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
        markings: normalizeProfileMarkings(row.markings),
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

    const markings = fd.get("markings");
    if (markings !== null) {
        update.markings = normalizeProfileMarkings(markings);
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

/**
 * Returns true when a database error came from the unique profile preference/slot constraint.
 */
function isProfileSlotConflict(error: unknown): boolean {
    const dbError = error as { code?: string; constraint?: string };

    return (
        dbError.code === "23505" &&
        dbError.constraint === "IX_profile_slot_preference_id"
    );
}

/**
 * Returns true when a database error came from a job uniqueness conflict that a retried transaction can resolve.
 */
function isFavoriteJobConflict(error: unknown): boolean {
    const dbError = error as { code?: string; constraint?: string };

    return (
        dbError.code === "23505" &&
        (dbError.constraint === "IX_job_one_high_priority" ||
            dbError.constraint === "IX_job_profile_id_job_name")
    );
}

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
 * Updates a profile and its Favorite job inside one transaction so either both changes commit or neither does.
 */
async function updateProfileAndFavoriteJobTransaction(
    profileId: number,
    profileUpdate: Partial<TableRowInsert> | null,
    rawJobName: unknown,
): Promise<void> {
    for (let attempt = 1; attempt <= maxFavoriteJobAttempts; attempt += 1) {
        try {
            await db.transaction(async (tx) => {
                if (profileUpdate) {
                    const updateResult = await tx
                        .update(profile)
                        .set(profileUpdate)
                        .where(eq(profile.profileId, profileId))
                        .execute();

                    const affectedRows =
                        typeof (updateResult as { rowCount?: number })
                            .rowCount === "number"
                            ? (updateResult as { rowCount: number }).rowCount
                            : Array.isArray(updateResult)
                              ? updateResult.length
                              : undefined;

                    if (affectedRows === 0) {
                        throw new Error("Update target no longer exists");
                    }

                    if (affectedRows === undefined) {
                        // Driver did not report affected rows; verify existence explicitly
                        const [exists] = await tx
                            .select({ profileId: profile.profileId })
                            .from(profile)
                            .where(eq(profile.profileId, profileId))
                            .limit(1)
                            .execute();

                        if (!exists) {
                            throw new Error("Update target no longer exists");
                        }
                    }
                } else {
                    // No profile update; still verify the profile exists before touching jobs
                    const [exists] = await tx
                        .select({ profileId: profile.profileId })
                        .from(profile)
                        .where(eq(profile.profileId, profileId))
                        .limit(1)
                        .execute();

                    if (!exists) {
                        throw new Error("Update target no longer exists");
                    }
                }

                await setFavoriteJobWithTx(tx, profileId, rawJobName);
            });

            return;
        } catch (error) {
            if (
                isFavoriteJobConflict(error) &&
                attempt < maxFavoriteJobAttempts
            ) {
                continue;
            }

            throw error;
        }
    }
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
        for (
            let attempt = 1;
            attempt <= maxProfileInsertAttempts;
            attempt += 1
        ) {
            try {
                await db.transaction(async (tx) => {
                    const profileInsert = await buildProfileInsert(
                        tx,
                        row,
                        preferenceId,
                    );
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
                return;
            } catch (error) {
                if (
                    (row.slot === undefined || row.slot === null) &&
                    isProfileSlotConflict(error) &&
                    attempt < maxProfileInsertAttempts
                ) {
                    continue;
                }

                throw error;
            }
        }
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
    const profileUpdateOrNull =
        Object.keys(profileUpdate).length > 0 ? profileUpdate : null;

    try {
        await updateProfileAndFavoriteJobTransaction(
            profileId,
            profileUpdateOrNull,
            favoriteJobName,
        );
        updateDbCacheTags(["profile", "job"]);
    } catch (error) {
        log.error("Update character error:", error);
        throw error;
    }
}
