"use server";

import { desc, eq } from "drizzle-orm";

import db from "@/db";
import { users } from "@/db/schema";
import { cacheDbRequest } from "@/lib/cache";
import { normalizeArrayOrValue } from "@/utils/stdfunc";
import { userSelectPublicSchema } from "@/utils/validate/schemas";

/**
 * Requests user id from the database.
 */
export async function requestUserId(usernameNormalized: string) {
    "use cache";
    cacheDbRequest(["users"]);

    return db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username_normalized, usernameNormalized))
        .limit(1)
        .execute();
}

/**
 * Gets user id.
 */
export async function getUserId(request: ReturnType<typeof requestUserId>) {
    const userId = normalizeArrayOrValue(await request);
    if (userId && userId.id) return userId.id;
    return null;
}

/**
 * Requests user from the database.
 */
export async function requestUser(uid: string | number) {
    "use cache";
    cacheDbRequest(["users"]);

    const field =
        typeof uid === "string" ? users.username_normalized : users.id;

    return db
        .select({
            username: users.username,
            username_normalized: users.username_normalized,
        })
        .from(users)
        .where(eq(field, uid))
        .limit(1)
        .execute();
}

/**
 * Gets user.
 */
export async function getUser(request: ReturnType<typeof requestUser>) {
    return userSelectPublicSchema.parse(normalizeArrayOrValue(await request));
}

/**
 * Requests all users from the database.
 */
export async function requestAllUsers() {
    "use cache";
    cacheDbRequest(["users"]);

    return db
        .select()
        .from(users)
        .orderBy(desc(users.username_normalized))
        .execute();
}

/**
 * Gets all users.
 */
export async function getAllUsers(request: ReturnType<typeof requestAllUsers>) {
    return userSelectPublicSchema.array().parse(await request);
}
