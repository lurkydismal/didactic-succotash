import { getSessionDataOrUnauthorized } from "@/lib/auth";

export default async function Template({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getSessionDataOrUnauthorized();

    return children;
}
