import {
    admin,
    adminFlag,
    adminLog,
    adminLogPlayer,
    adminMessages,
    adminNotes,
    adminRank,
    adminRankFlag,
    adminWatchlists,
    antag,
    assignedUserId,
    banTemplate,
    blacklist,
    connectionLog,
    efMigrationsHistory,
    ipintelCache,
    job,
    playTime,
    player,
    playerRound,
    preference,
    profile,
    profileLoadout,
    profileLoadoutGroup,
    profileRoleLoadout,
    rmcDiscordAccounts,
    rmcLinkedAccounts,
    rmcLinkedAccountsLogs,
    rmcLinkingCodes,
    rmcPatronLobbyMessages,
    rmcPatronRoundEndNtShoutouts,
    rmcPatronTiers,
    rmcPatrons,
    roleWhitelists,
    round,
    server,
    serverBan,
    serverBanExemption,
    serverBanHit,
    serverRoleBan,
    serverRoleUnban,
    serverUnban,
    trait,
    uploadedResourceLog,
    users,
    whitelist,
} from "./schema";

export type UsersRow = typeof users.$inferSelect;
export type UsersRowInsert = typeof users.$inferInsert;
export type UsersRowPublic = Omit<
    UsersRow,
    "id" | "password_hash" | "created_at" | "updated_at"
>;

export type EfMigrationsHistoryRow = typeof efMigrationsHistory.$inferSelect;
export type EfMigrationsHistoryRowInsert =
    typeof efMigrationsHistory.$inferInsert;

export type AdminRow = typeof admin.$inferSelect;
export type AdminRowInsert = typeof admin.$inferInsert;

export type AdminFlagRow = typeof adminFlag.$inferSelect;
export type AdminFlagRowInsert = typeof adminFlag.$inferInsert;

export type AdminLogRow = typeof adminLog.$inferSelect;
export type AdminLogRowInsert = typeof adminLog.$inferInsert;

export type AdminLogPlayerRow = typeof adminLogPlayer.$inferSelect;
export type AdminLogPlayerRowInsert = typeof adminLogPlayer.$inferInsert;

export type AdminMessagesRow = typeof adminMessages.$inferSelect;
export type AdminMessagesRowInsert = typeof adminMessages.$inferInsert;

export type AdminNotesRow = typeof adminNotes.$inferSelect;
export type AdminNotesRowInsert = typeof adminNotes.$inferInsert;

export type AdminRankRow = typeof adminRank.$inferSelect;
export type AdminRankRowInsert = typeof adminRank.$inferInsert;

export type AdminRankFlagRow = typeof adminRankFlag.$inferSelect;
export type AdminRankFlagRowInsert = typeof adminRankFlag.$inferInsert;

export type AdminWatchlistsRow = typeof adminWatchlists.$inferSelect;
export type AdminWatchlistsRowInsert = typeof adminWatchlists.$inferInsert;

export type AntagRow = typeof antag.$inferSelect;
export type AntagRowInsert = typeof antag.$inferInsert;

export type AssignedUserIdRow = typeof assignedUserId.$inferSelect;
export type AssignedUserIdRowInsert = typeof assignedUserId.$inferInsert;

export type BanTemplateRow = typeof banTemplate.$inferSelect;
export type BanTemplateRowInsert = typeof banTemplate.$inferInsert;

export type BlacklistRow = typeof blacklist.$inferSelect;
export type BlacklistRowInsert = typeof blacklist.$inferInsert;

export type ConnectionLogRow = typeof connectionLog.$inferSelect;
export type ConnectionLogRowInsert = typeof connectionLog.$inferInsert;
export type ConnectionLogRowPublic = Omit<ConnectionLogRow, "address" | "hwid">;

export type IpintelCacheRow = typeof ipintelCache.$inferSelect;
export type IpintelCacheRowInsert = typeof ipintelCache.$inferInsert;
export type IpintelCacheRowPublic = Omit<IpintelCacheRow, "address">;

export type JobRow = typeof job.$inferSelect;
export type JobRowInsert = typeof job.$inferInsert;

export type PlayTimeRow = typeof playTime.$inferSelect;
export type PlayTimeRowInsert = typeof playTime.$inferInsert;

export type PlayerRow = typeof player.$inferSelect;
export type PlayerRowInsert = typeof player.$inferInsert;
export type PlayerRowPublic = Omit<
    PlayerRow,
    "lastSeenAddress" | "lastSeenHwid"
>;

export type PlayerRoundRow = typeof playerRound.$inferSelect;
export type PlayerRoundRowInsert = typeof playerRound.$inferInsert;

export type PreferenceRow = typeof preference.$inferSelect;
export type PreferenceRowInsert = typeof preference.$inferInsert;

export type ProfileRow = typeof profile.$inferSelect;
export type ProfileRowInsert = typeof profile.$inferInsert;

export type ProfileLoadoutRow = typeof profileLoadout.$inferSelect;
export type ProfileLoadoutRowInsert = typeof profileLoadout.$inferInsert;

export type ProfileLoadoutGroupRow = typeof profileLoadoutGroup.$inferSelect;
export type ProfileLoadoutGroupRowInsert =
    typeof profileLoadoutGroup.$inferInsert;

export type ProfileRoleLoadoutRow = typeof profileRoleLoadout.$inferSelect;
export type ProfileRoleLoadoutRowInsert =
    typeof profileRoleLoadout.$inferInsert;

export type RmcDiscordAccountsRow = typeof rmcDiscordAccounts.$inferSelect;
export type RmcDiscordAccountsRowInsert =
    typeof rmcDiscordAccounts.$inferInsert;

export type RmcLinkedAccountsRow = typeof rmcLinkedAccounts.$inferSelect;
export type RmcLinkedAccountsRowInsert = typeof rmcLinkedAccounts.$inferInsert;
export type RmcLinkedAccountsRowPublic = Omit<
    RmcLinkedAccountsRow,
    "discordId"
>;

export type RmcLinkedAccountsLogsRow =
    typeof rmcLinkedAccountsLogs.$inferSelect;
export type RmcLinkedAccountsLogsRowInsert =
    typeof rmcLinkedAccountsLogs.$inferInsert;
export type RmcLinkedAccountsLogsRowPublic = Omit<
    RmcLinkedAccountsLogsRow,
    "discordId"
>;

export type RmcLinkingCodesRow = typeof rmcLinkingCodes.$inferSelect;
export type RmcLinkingCodesRowInsert = typeof rmcLinkingCodes.$inferInsert;
export type RmcLinkingCodesRowPublic = Omit<RmcLinkingCodesRow, "code">;

export type RmcPatronLobbyMessagesRow =
    typeof rmcPatronLobbyMessages.$inferSelect;
export type RmcPatronLobbyMessagesRowInsert =
    typeof rmcPatronLobbyMessages.$inferInsert;

export type RmcPatronRoundEndNtShoutoutsRow =
    typeof rmcPatronRoundEndNtShoutouts.$inferSelect;
export type RmcPatronRoundEndNtShoutoutsRowInsert =
    typeof rmcPatronRoundEndNtShoutouts.$inferInsert;

export type RmcPatronTiersRow = typeof rmcPatronTiers.$inferSelect;
export type RmcPatronTiersRowInsert = typeof rmcPatronTiers.$inferInsert;

export type RmcPatronsRow = typeof rmcPatrons.$inferSelect;
export type RmcPatronsRowInsert = typeof rmcPatrons.$inferInsert;

export type RoleWhitelistsRow = typeof roleWhitelists.$inferSelect;
export type RoleWhitelistsRowInsert = typeof roleWhitelists.$inferInsert;

export type RoundRow = typeof round.$inferSelect;
export type RoundRowInsert = typeof round.$inferInsert;

export type ServerRow = typeof server.$inferSelect;
export type ServerRowInsert = typeof server.$inferInsert;

export type ServerBanRow = typeof serverBan.$inferSelect;
export type ServerBanRowInsert = typeof serverBan.$inferInsert;
export type ServerBanRowPublic = Omit<ServerBanRow, "address" | "hwid">;

export type ServerBanExemptionRow = typeof serverBanExemption.$inferSelect;
export type ServerBanExemptionRowInsert =
    typeof serverBanExemption.$inferInsert;

export type ServerBanHitRow = typeof serverBanHit.$inferSelect;
export type ServerBanHitRowInsert = typeof serverBanHit.$inferInsert;

export type ServerRoleBanRow = typeof serverRoleBan.$inferSelect;
export type ServerRoleBanRowInsert = typeof serverRoleBan.$inferInsert;
export type ServerRoleBanRowPublic = Omit<ServerRoleBanRow, "address" | "hwid">;

export type ServerRoleUnbanRow = typeof serverRoleUnban.$inferSelect;
export type ServerRoleUnbanRowInsert = typeof serverRoleUnban.$inferInsert;

export type ServerUnbanRow = typeof serverUnban.$inferSelect;
export type ServerUnbanRowInsert = typeof serverUnban.$inferInsert;

export type TraitRow = typeof trait.$inferSelect;
export type TraitRowInsert = typeof trait.$inferInsert;

export type UploadedResourceLogRow = typeof uploadedResourceLog.$inferSelect;
export type UploadedResourceLogRowInsert =
    typeof uploadedResourceLog.$inferInsert;

export type WhitelistRow = typeof whitelist.$inferSelect;
export type WhitelistRowInsert = typeof whitelist.$inferInsert;
