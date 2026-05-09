type Position = "left" | "right";

export interface NavItem {
    name: string;
    href: string;
    position: Position;
    badge?: boolean;
}

export const items: NavItem[] = [
    {
        name: "Bans",
        href: "/dashboard/bans",
        position: "left",
    },
    {
        name: "Role bans",
        href: "/dashboard/role-bans",
        position: "left",
    },
    {
        name: "Players",
        href: "/dashboard/players",
        position: "left",
    },
    {
        name: "Connections",
        href: "/dashboard/connections",
        position: "left",
    },
    {
        name: "Logs",
        href: "/dashboard/logs",
        position: "right",
    },
    {
        name: "Characters",
        href: "/dashboard/characters",
        position: "right",
    },
    {
        name: "Whitelist",
        href: "/dashboard/whitelist",
        position: "right",
    },
];
