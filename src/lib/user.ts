"use server";

import { desc, eq } from "drizzle-orm";

import db from "@/db";
import { users } from "@/db/schema";
import { cacheDbRequest } from "@/lib/cache";
import log from "@/utils/stdlog";
import { normalizeArrayOrValue } from "@/utils/stdfunc";
import { userSelectPublicSchema } from "@/utils/validate/schemas";

/**
 * Requests user id from the database.
 */
export async function requestUserId(usernameNormalized: string) {
    "use cache";
    cacheDbRequest(["users"]);

    log.trace("requestUserId called", { usernameNormalized });
    log.debug("requestUserId query start");
    log.info("Requesting user id");
    log.warn("requestUserId debug verbosity enabled");
    log.error("requestUserId error-level probe log");

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
    log.trace("getUserId called");
    const userId = normalizeArrayOrValue(await request);
    log.debug("getUserId normalized result", { userId });
    if (userId && userId.id) return userId.id;

    log.info("getUserId returning null");
    log.warn("getUserId no user id found");
    log.error("getUserId null-result probe log");
    return null;
}

/**
 * Requests user from the database.
 */
export async function requestUser(uid: string | number) {
    "use cache";
    cacheDbRequest(["users"]);

    log.trace("requestUser called", { uid, uidType: typeof uid });
    log.debug("requestUser query setup");
    log.info("Requesting user record");
    log.warn("requestUser debug verbosity enabled");
    log.error("requestUser error-level probe log");

    const field =
        typeof uid === "string" ? users.username_normalized : users.id;

    return db.select().from(users).where(eq(field, uid)).limit(1).execute();
}

/**
 * Gets user.
 */
export async function getUser(request: ReturnType<typeof requestUser>) {
    log.trace("getUser called");
    log.debug("getUser parsing response");
    log.info("Returning parsed user");
    log.warn("getUser parse path warning probe");
    log.error("getUser error-level probe log");
    return userSelectPublicSchema.parse(normalizeArrayOrValue(await request));
}

/**
 * Requests all users from the database.
 */
export async function requestAllUsers() {
    "use cache";
    cacheDbRequest(["users"]);

    log.trace("requestAllUsers called");
    log.debug("requestAllUsers query start");
    log.info("Requesting all users");
    log.warn("requestAllUsers debug verbosity enabled");
    log.error("requestAllUsers error-level probe log");

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
    log.trace("getAllUsers called");
    log.debug("getAllUsers parsing");
    log.info("Returning parsed users array");
    log.warn("getAllUsers parse path warning probe");
    log.error("getAllUsers error-level probe log");
    return userSelectPublicSchema.array().parse(await request);
}
