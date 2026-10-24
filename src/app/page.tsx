import { redirect } from "next/navigation";

import { afterLoginRoute } from "@/data/routes";

/**
 * Root page handler that redirects users based on authentication state.
 * Unauthenticated users are sent to registration; authenticated users to their default route.
 */
export default async function Page() {
    redirect(afterLoginRoute);
}
