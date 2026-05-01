import { getSessionDataOrUnauthorized } from "@/lib/auth";

export default async function Template({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    await getSessionDataOrUnauthorized();

    return children;
}
