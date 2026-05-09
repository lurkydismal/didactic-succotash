import { pgTable, uuid, integer, numeric, varchar, text, timestamp, boolean, inet, interval, real, customType, jsonb, smallint, uniqueIndex, index, foreignKey, type AnyPgColumn, primaryKey, unique, check } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const efMigrationsHistory = pgTable("__EFMigrationsHistory", {
	migrationId: varchar("MigrationId", { length: 150 }).primaryKey(),
	productVersion: varchar("ProductVersion", { length: 32 }).notNull(),
});

export const admin = pgTable("admin", {
	userId: uuid("user_id").primaryKey(),
	title: text(),
	adminRankId: integer("admin_rank_id").references(() => adminRank.adminRankId, { onDelete: "set null" }),
	deadminned: boolean().default(false).notNull(),
	suspended: boolean().default(false).notNull(),
}, (table) => [
	index("IX_admin_admin_rank_id").using("btree", table.adminRankId.asc().nullsLast()),
]);

export const adminFlag = pgTable("admin_flag", {
	adminFlagId: integer("admin_flag_id").primaryKey().generatedByDefaultAsIdentity(),
	flag: text().notNull(),
	negative: boolean().notNull(),
	adminId: uuid("admin_id").notNull().references(() => admin.userId, { onDelete: "cascade" }),
}, (table) => [
	index("IX_admin_flag_admin_id").using("btree", table.adminId.asc().nullsLast()),
	uniqueIndex("IX_admin_flag_flag_admin_id").using("btree", table.flag.asc().nullsLast(), table.adminId.asc().nullsLast()),
]);

export const adminLog = pgTable("admin_log", {
	adminLogId: integer("admin_log_id").notNull(),
	roundId: integer("round_id").notNull().references(() => round.roundId, { onDelete: "cascade" }),
	type: integer().notNull(),
	date: timestamp({ withTimezone: true }).notNull(),
	message: text().notNull(),
	json: jsonb().notNull(),
	impact: smallint().default(0).notNull(),
}, (table) => [
	primaryKey({ columns: [table.roundId, table.adminLogId], name: "PK_admin_log" }),
	index("IX_admin_log_date").using("btree", table.date.asc().nullsLast()),
	index("IX_admin_log_message").using("gin", sql`to_tsvector('english'::regconfig, message)`),
	index("IX_admin_log_type").using("btree", table.type.asc().nullsLast()),
]);

export const adminLogPlayer = pgTable("admin_log_player", {
	playerUserId: uuid("player_user_id").notNull().references(() => player.userId, { onDelete: "cascade" }),
	logId: integer("log_id").notNull(),
	roundId: integer("round_id").notNull(),
}, (table) => [
	primaryKey({ columns: [table.roundId, table.logId, table.playerUserId], name: "PK_admin_log_player" }),
	foreignKey({
		columns: [table.roundId, table.logId],
		foreignColumns: [adminLog.roundId, adminLog.adminLogId],
		name: "FK_admin_log_player_admin_log_round_id_log_id"
	}).onDelete("cascade"),
	index("IX_admin_log_player_player_user_id").using("btree", table.playerUserId.asc().nullsLast()),
]);

export const adminMessages = pgTable("admin_messages", {
	adminMessagesId: integer("admin_messages_id").primaryKey().generatedByDefaultAsIdentity(),
	roundId: integer("round_id").references(() => round.roundId),
	playerUserId: uuid("player_user_id").references(() => player.userId, { onDelete: "cascade" }),
	playtimeAtNote: interval("playtime_at_note").notNull(),
	message: varchar({ length: 4096 }).notNull(),
	createdById: uuid("created_by_id").references(() => player.userId, { onDelete: "set null" }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
	lastEditedById: uuid("last_edited_by_id").references(() => player.userId, { onDelete: "set null" }),
	lastEditedAt: timestamp("last_edited_at", { withTimezone: true }),
	expirationTime: timestamp("expiration_time", { withTimezone: true }),
	deleted: boolean().notNull(),
	deletedById: uuid("deleted_by_id").references(() => player.userId, { onDelete: "set null" }),
	deletedAt: timestamp("deleted_at", { withTimezone: true }),
	seen: boolean().notNull(),
	dismissed: boolean().default(false).notNull(),
}, (table) => [
	index("IX_admin_messages_created_by_id").using("btree", table.createdById.asc().nullsLast()),
	index("IX_admin_messages_deleted_by_id").using("btree", table.deletedById.asc().nullsLast()),
	index("IX_admin_messages_last_edited_by_id").using("btree", table.lastEditedById.asc().nullsLast()),
	index("IX_admin_messages_player_user_id").using("btree", table.playerUserId.asc().nullsLast()),
	index("IX_admin_messages_round_id").using("btree", table.roundId.asc().nullsLast()),
	check("NotDismissedAndSeen", sql`((NOT dismissed) OR seen)`),]);

export const adminNotes = pgTable("admin_notes", {
	adminNotesId: integer("admin_notes_id").primaryKey().generatedByDefaultAsIdentity(),
	roundId: integer("round_id").references(() => round.roundId),
	playerUserId: uuid("player_user_id").references(() => player.userId, { onDelete: "cascade" }),
	message: varchar({ length: 4096 }).notNull(),
	createdById: uuid("created_by_id").references(() => player.userId, { onDelete: "set null" }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
	lastEditedById: uuid("last_edited_by_id").references(() => player.userId, { onDelete: "set null" }),
	lastEditedAt: timestamp("last_edited_at", { withTimezone: true }).notNull(),
	deleted: boolean().notNull(),
	deletedById: uuid("deleted_by_id").references(() => player.userId, { onDelete: "set null" }),
	deletedAt: timestamp("deleted_at", { withTimezone: true }),
	secret: boolean().notNull(),
	expirationTime: timestamp("expiration_time", { withTimezone: true }),
	severity: integer().default(1).notNull(),
	playtimeAtNote: interval("playtime_at_note").default("00:00:00").notNull(),
}, (table) => [
	index("IX_admin_notes_created_by_id").using("btree", table.createdById.asc().nullsLast()),
	index("IX_admin_notes_deleted_by_id").using("btree", table.deletedById.asc().nullsLast()),
	index("IX_admin_notes_last_edited_by_id").using("btree", table.lastEditedById.asc().nullsLast()),
	index("IX_admin_notes_player_user_id").using("btree", table.playerUserId.asc().nullsLast()),
	index("IX_admin_notes_round_id").using("btree", table.roundId.asc().nullsLast()),
]);

export const adminRank = pgTable("admin_rank", {
	adminRankId: integer("admin_rank_id").primaryKey().generatedByDefaultAsIdentity(),
	name: text().notNull(),
});

export const adminRankFlag = pgTable("admin_rank_flag", {
	adminRankFlagId: integer("admin_rank_flag_id").primaryKey().generatedByDefaultAsIdentity(),
	flag: text().notNull(),
	adminRankId: integer("admin_rank_id").notNull().references(() => adminRank.adminRankId, { onDelete: "cascade" }),
}, (table) => [
	index("IX_admin_rank_flag_admin_rank_id").using("btree", table.adminRankId.asc().nullsLast()),
	uniqueIndex("IX_admin_rank_flag_flag_admin_rank_id").using("btree", table.flag.asc().nullsLast(), table.adminRankId.asc().nullsLast()),
]);

export const adminWatchlists = pgTable("admin_watchlists", {
	adminWatchlistsId: integer("admin_watchlists_id").primaryKey().generatedByDefaultAsIdentity(),
	roundId: integer("round_id").references(() => round.roundId),
	playerUserId: uuid("player_user_id").references(() => player.userId, { onDelete: "cascade" }),
	playtimeAtNote: interval("playtime_at_note").notNull(),
	message: varchar({ length: 4096 }).notNull(),
	createdById: uuid("created_by_id").references(() => player.userId, { onDelete: "set null" }),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
	lastEditedById: uuid("last_edited_by_id").references(() => player.userId, { onDelete: "set null" }),
	lastEditedAt: timestamp("last_edited_at", { withTimezone: true }).notNull(),
	expirationTime: timestamp("expiration_time", { withTimezone: true }),
	deleted: boolean().notNull(),
	deletedById: uuid("deleted_by_id").references(() => player.userId, { onDelete: "set null" }),
	deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (table) => [
	index("IX_admin_watchlists_created_by_id").using("btree", table.createdById.asc().nullsLast()),
	index("IX_admin_watchlists_deleted_by_id").using("btree", table.deletedById.asc().nullsLast()),
	index("IX_admin_watchlists_last_edited_by_id").using("btree", table.lastEditedById.asc().nullsLast()),
	index("IX_admin_watchlists_player_user_id").using("btree", table.playerUserId.asc().nullsLast()),
	index("IX_admin_watchlists_round_id").using("btree", table.roundId.asc().nullsLast()),
]);

export const antag = pgTable("antag", {
	antagId: integer("antag_id").primaryKey().generatedByDefaultAsIdentity(),
	profileId: integer("profile_id").notNull().references(() => profile.profileId, { onDelete: "cascade" }),
	antagName: text("antag_name").notNull(),
}, (table) => [
	uniqueIndex("IX_antag_profile_id_antag_name").using("btree", table.profileId.asc().nullsLast(), table.antagName.asc().nullsLast()),
]);

export const assignedUserId = pgTable("assigned_user_id", {
	assignedUserIdId: integer("assigned_user_id_id").primaryKey().generatedByDefaultAsIdentity(),
	userName: text("user_name").notNull(),
	userId: uuid("user_id").notNull(),
}, (table) => [
	uniqueIndex("IX_assigned_user_id_user_id").using("btree", table.userId.asc().nullsLast()),
	uniqueIndex("IX_assigned_user_id_user_name").using("btree", table.userName.asc().nullsLast()),
]);

export const banTemplate = pgTable("ban_template", {
	banTemplateId: integer("ban_template_id").primaryKey().generatedByDefaultAsIdentity(),
	title: text().notNull(),
	length: interval().notNull(),
	reason: text().notNull(),
	exemptFlags: integer("exempt_flags").notNull(),
	severity: integer().notNull(),
	autoDelete: boolean("auto_delete").notNull(),
	hidden: boolean().notNull(),
});

export const blacklist = pgTable("blacklist", {
	userId: uuid("user_id").primaryKey(),
});

export const connectionLog = pgTable("connection_log", {
	connectionLogId: integer("connection_log_id").primaryKey().generatedByDefaultAsIdentity(),
	userId: uuid("user_id").notNull(),
	userName: text("user_name").notNull(),
	time: timestamp({ withTimezone: true }).notNull(),
	address: inet().notNull(),
	hwid: customType({ dataType: () => 'bytea' })(),
	denied: smallint(),
	serverId: integer("server_id").default(0).notNull().references(() => server.serverId, { onDelete: "set null" }),
	hwidType: integer("hwid_type").default(0),
	trust: real().default(0).notNull(),
}, (table) => [
	index("IX_connection_log_time").using("btree", table.time.asc().nullsLast()),
	index("IX_connection_log_user_id").using("btree", table.userId.asc().nullsLast()),
	check("AddressNotIPv6MappedIPv4", sql`(NOT ('::ffff:0.0.0.0/96'::inet >>= address))`),]);

export const ipintelCache = pgTable("ipintel_cache", {
	ipintelCacheId: integer("ipintel_cache_id").primaryKey().generatedByDefaultAsIdentity(),
	address: inet().notNull(),
	time: timestamp({ withTimezone: true }).notNull(),
	score: real().notNull(),
}, (table) => [
	uniqueIndex("idx_ipintel_cache_address").using("btree", table.address.asc().nullsLast()),
]);

export const job = pgTable("job", {
	jobId: integer("job_id").primaryKey().generatedByDefaultAsIdentity(),
	profileId: integer("profile_id").notNull().references(() => profile.profileId, { onDelete: "cascade" }),
	jobName: text("job_name").notNull(),
	priority: integer().notNull(),
}, (table) => [
	uniqueIndex("IX_job_one_high_priority").using("btree", table.profileId.asc().nullsLast()).where(sql`(priority = 3)`),
	index("IX_job_profile_id").using("btree", table.profileId.asc().nullsLast()),
	uniqueIndex("IX_job_profile_id_job_name").using("btree", table.profileId.asc().nullsLast(), table.jobName.asc().nullsLast()),
]);

export const playTime = pgTable("play_time", {
	playTimeId: integer("play_time_id").primaryKey().generatedByDefaultAsIdentity(),
	playerId: uuid("player_id").notNull(),
	tracker: text().notNull(),
	timeSpent: interval("time_spent").notNull(),
}, (table) => [
	uniqueIndex("IX_play_time_player_id_tracker").using("btree", table.playerId.asc().nullsLast(), table.tracker.asc().nullsLast()),
]);

export const player = pgTable("player", {
	playerId: integer("player_id").primaryKey().generatedByDefaultAsIdentity(),
	userId: uuid("user_id").notNull(),
	firstSeenTime: timestamp("first_seen_time", { withTimezone: true }).notNull(),
	lastSeenUserName: text("last_seen_user_name").notNull(),
	lastSeenTime: timestamp("last_seen_time", { withTimezone: true }).notNull(),
	lastSeenAddress: inet("last_seen_address").notNull(),
	lastSeenHwid: customType({ dataType: () => 'bytea' })("last_seen_hwid"),
	lastReadRules: timestamp("last_read_rules", { withTimezone: true }),
	lastSeenHwidType: integer("last_seen_hwid_type").default(0),
	lastRolledAntag: interval("last_rolled_antag"),
}, (table) => [
	index("IX_player_last_seen_user_name").using("btree", table.lastSeenUserName.asc().nullsLast()),
	uniqueIndex("IX_player_user_id").using("btree", table.userId.asc().nullsLast()),
	unique("ak_player_user_id").on(table.userId), check("LastSeenAddressNotIPv6MappedIPv4", sql`(NOT ('::ffff:0.0.0.0/96'::inet >>= last_seen_address))`),]);

export const playerRound = pgTable("player_round", {
	playersId: integer("players_id").notNull().references(() => player.playerId, { onDelete: "cascade" }),
	roundsId: integer("rounds_id").notNull().references(() => round.roundId, { onDelete: "cascade" }),
}, (table) => [
	primaryKey({ columns: [table.playersId, table.roundsId], name: "PK_player_round" }),
	index("IX_player_round_rounds_id").using("btree", table.roundsId.asc().nullsLast()),
]);

export const preference = pgTable("preference", {
	preferenceId: integer("preference_id").primaryKey().generatedByDefaultAsIdentity(),
	userId: uuid("user_id").notNull(),
	selectedCharacterSlot: integer("selected_character_slot").notNull(),
	adminOocColor: text("admin_ooc_color").default("#ff0000").notNull(),
	constructionFavorites: text("construction_favorites").array().default(sql`ARRAY[]`).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.selectedCharacterSlot, table.preferenceId],
		foreignColumns: [profile.slot, profile.preferenceId],
		name: "FK_preference_profile_selected_character_slot_preference_id"
	}),
	uniqueIndex("IX_preference_user_id").using("btree", table.userId.asc().nullsLast()),
]);

export const profile = pgTable("profile", {
	profileId: integer("profile_id").primaryKey().generatedByDefaultAsIdentity(),
	slot: integer().notNull(),
	charName: text("char_name").notNull(),
	age: integer().notNull(),
	sex: text().notNull(),
	hairName: text("hair_name").notNull(),
	hairColor: text("hair_color").notNull(),
	facialHairName: text("facial_hair_name").notNull(),
	facialHairColor: text("facial_hair_color").notNull(),
	eyeColor: text("eye_color").notNull(),
	skinColor: text("skin_color").notNull(),
	prefUnavailable: integer("pref_unavailable").notNull(),
	preferenceId: integer("preference_id").notNull().references((): AnyPgColumn => preference.preferenceId, { onDelete: "cascade" }),
	gender: text().default("").notNull(),
	species: text().default("").notNull(),
	markings: jsonb(),
	flavorText: text("flavor_text").default("").notNull(),
	spawnPriority: integer("spawn_priority").default(0).notNull(),
	borgName: text("borg_name").default("").notNull(),
	height: real().default(1).notNull(),
	width: real().default(1).notNull(),
	voice: text().default("").notNull(),
	bodyType: text("body_type").default("").notNull(),
}, (table) => [
	index("IX_profile_preference_id").using("btree", table.preferenceId.asc().nullsLast()),
	uniqueIndex("IX_profile_slot_preference_id").using("btree", table.slot.asc().nullsLast(), table.preferenceId.asc().nullsLast()),
]);

export const profileLoadout = pgTable("profile_loadout", {
	profileLoadoutId: integer("profile_loadout_id").primaryKey().generatedByDefaultAsIdentity(),
	profileLoadoutGroupId: integer("profile_loadout_group_id").notNull().references(() => profileLoadoutGroup.profileLoadoutGroupId, { onDelete: "cascade" }),
	loadoutName: text("loadout_name").notNull(),
}, (table) => [
	index("IX_profile_loadout_profile_loadout_group_id").using("btree", table.profileLoadoutGroupId.asc().nullsLast()),
]);

export const profileLoadoutGroup = pgTable("profile_loadout_group", {
	profileLoadoutGroupId: integer("profile_loadout_group_id").primaryKey().generatedByDefaultAsIdentity(),
	profileRoleLoadoutId: integer("profile_role_loadout_id").notNull().references(() => profileRoleLoadout.profileRoleLoadoutId, { onDelete: "cascade" }),
	groupName: text("group_name").notNull(),
}, (table) => [
	index("IX_profile_loadout_group_profile_role_loadout_id").using("btree", table.profileRoleLoadoutId.asc().nullsLast()),
]);

export const profileRoleLoadout = pgTable("profile_role_loadout", {
	profileRoleLoadoutId: integer("profile_role_loadout_id").primaryKey().generatedByDefaultAsIdentity(),
	profileId: integer("profile_id").notNull().references(() => profile.profileId, { onDelete: "cascade" }),
	roleName: text("role_name").notNull(),
	entityName: varchar("entity_name", { length: 256 }),
}, (table) => [
	index("IX_profile_role_loadout_profile_id").using("btree", table.profileId.asc().nullsLast()),
]);

export const rmcDiscordAccounts = pgTable("rmc_discord_accounts", {
	rmcDiscordAccountsId: numeric("rmc_discord_accounts_id", { precision: 20, scale: 0 }).primaryKey(),
});

export const rmcLinkedAccounts = pgTable("rmc_linked_accounts", {
	playerId: uuid("player_id").primaryKey().references(() => player.userId, { onDelete: "cascade" }),
	discordId: numeric("discord_id", { precision: 20, scale: 0 }).notNull().references(() => rmcDiscordAccounts.rmcDiscordAccountsId, { onDelete: "cascade" }),
}, (table) => [
	uniqueIndex("IX_rmc_linked_accounts_discord_id").using("btree", table.discordId.asc().nullsLast()),
]);

export const rmcLinkedAccountsLogs = pgTable("rmc_linked_accounts_logs", {
	rmcLinkedAccountsLogsId: integer("rmc_linked_accounts_logs_id").primaryKey().generatedByDefaultAsIdentity(),
	playerId: uuid("player_id").notNull().references(() => player.userId, { onDelete: "cascade" }),
	discordId: numeric("discord_id", { precision: 20, scale: 0 }).notNull().references(() => rmcDiscordAccounts.rmcDiscordAccountsId, { onDelete: "cascade" }),
	at: timestamp({ withTimezone: true }).notNull(),
}, (table) => [
	index("IX_rmc_linked_accounts_logs_at").using("btree", table.at.asc().nullsLast()),
	index("IX_rmc_linked_accounts_logs_discord_id").using("btree", table.discordId.asc().nullsLast()),
	index("IX_rmc_linked_accounts_logs_player_id").using("btree", table.playerId.asc().nullsLast()),
]);

export const rmcLinkingCodes = pgTable("rmc_linking_codes", {
	playerId: uuid("player_id").primaryKey().references(() => player.userId, { onDelete: "cascade" }),
	code: uuid().notNull(),
	creationTime: timestamp("creation_time", { withTimezone: true }).notNull(),
}, (table) => [
	index("IX_rmc_linking_codes_code").using("btree", table.code.asc().nullsLast()),
]);

export const rmcPatronLobbyMessages = pgTable("rmc_patron_lobby_messages", {
	patronId: uuid("patron_id").primaryKey().references(() => rmcPatrons.playerId, { onDelete: "cascade" }),
	message: varchar({ length: 500 }).notNull(),
});

export const rmcPatronRoundEndNtShoutouts = pgTable("rmc_patron_round_end_nt_shoutouts", {
	patronId: uuid("patron_id").primaryKey().references(() => rmcPatrons.playerId, { onDelete: "cascade" }),
	name: varchar({ length: 100 }).notNull(),
});

export const rmcPatronTiers = pgTable("rmc_patron_tiers", {
	rmcPatronTiersId: integer("rmc_patron_tiers_id").primaryKey().generatedByDefaultAsIdentity(),
	showOnCredits: boolean("show_on_credits").notNull(),
	lobbyMessage: boolean("lobby_message").notNull(),
	roundEndShoutout: boolean("round_end_shoutout").notNull(),
	discordRole: numeric("discord_role", { mode: 'number', precision: 20, scale: 0 }).default(0.0).notNull(),
	name: text().default("").notNull(),
	priority: integer().default(0).notNull(),
	ghostColor: boolean("ghost_color").default(false).notNull(),
}, (table) => [
	uniqueIndex("IX_rmc_patron_tiers_discord_role").using("btree", table.discordRole.asc().nullsLast()),
	index("IX_rmc_patron_tiers_lobby_message").using("btree", table.lobbyMessage.asc().nullsLast()),
	index("IX_rmc_patron_tiers_round_end_shoutout").using("btree", table.roundEndShoutout.asc().nullsLast()),
]);

export const rmcPatrons = pgTable("rmc_patrons", {
	playerId: uuid("player_id").primaryKey().references(() => player.userId, { onDelete: "cascade" }),
	tierId: integer("tier_id").notNull().references(() => rmcPatronTiers.rmcPatronTiersId, { onDelete: "cascade" }),
	ghostColor: integer("ghost_color"),
}, (table) => [
	index("IX_rmc_patrons_tier_id").using("btree", table.tierId.asc().nullsLast()),
]);

export const roleWhitelists = pgTable("role_whitelists", {
	playerUserId: uuid("player_user_id").notNull().references(() => player.userId, { onDelete: "cascade" }),
	roleId: text("role_id").notNull(),
}, (table) => [
	primaryKey({ columns: [table.playerUserId, table.roleId], name: "PK_role_whitelists" }),
]);

export const round = pgTable("round", {
	roundId: integer("round_id").primaryKey().generatedByDefaultAsIdentity(),
	serverId: integer("server_id").default(0).notNull().references(() => server.serverId, { onDelete: "cascade" }),
	startDate: timestamp("start_date", { withTimezone: true }),
}, (table) => [
	index("IX_round_server_id").using("btree", table.serverId.asc().nullsLast()),
	index("IX_round_start_date").using("btree", table.startDate.asc().nullsLast()),
]);

export const server = pgTable("server", {
	serverId: integer("server_id").primaryKey().generatedByDefaultAsIdentity(),
	name: text().notNull(),
});

export const serverBan = pgTable("server_ban", {
	serverBanId: integer("server_ban_id").primaryKey().generatedByDefaultAsIdentity(),
	playerUserId: uuid("player_user_id"),
	address: inet(),
	banTime: timestamp("ban_time", { withTimezone: true }).notNull(),
	expirationTime: timestamp("expiration_time", { withTimezone: true }),
	reason: text().notNull(),
	banningAdmin: uuid("banning_admin").references(() => player.userId, { onDelete: "set null" }),
	hwid: customType({ dataType: () => 'bytea' })(),
	exemptFlags: integer("exempt_flags").default(0).notNull(),
	autoDelete: boolean("auto_delete").default(false).notNull(),
	hidden: boolean().default(false).notNull(),
	lastEditedAt: timestamp("last_edited_at", { withTimezone: true }),
	lastEditedById: uuid("last_edited_by_id").references(() => player.userId, { onDelete: "set null" }),
	playtimeAtNote: interval("playtime_at_note").default("00:00:00").notNull(),
	roundId: integer("round_id").references(() => round.roundId),
	severity: integer().default(3).notNull(),
	hwidType: integer("hwid_type").default(0),
}, (table) => [
	index("IX_server_ban_address").using("btree", table.address.asc().nullsLast()),
	index("IX_server_ban_banning_admin").using("btree", table.banningAdmin.asc().nullsLast()),
	index("IX_server_ban_last_edited_by_id").using("btree", table.lastEditedById.asc().nullsLast()),
	index("IX_server_ban_player_user_id").using("btree", table.playerUserId.asc().nullsLast()),
	index("IX_server_ban_round_id").using("btree", table.roundId.asc().nullsLast()),
	check("AddressNotIPv6MappedIPv4", sql`(NOT ('::ffff:0.0.0.0/96'::inet >>= address))`), check("HaveEitherAddressOrUserIdOrHWId", sql`((address IS NOT NULL) OR (player_user_id IS NOT NULL) OR (hwid IS NOT NULL))`),]);

export const serverBanExemption = pgTable("server_ban_exemption", {
	userId: uuid("user_id").primaryKey(),
	flags: integer().notNull(),
}, (table) => [
	check("FlagsNotZero", sql`(flags <> 0)`),]);

export const serverBanHit = pgTable("server_ban_hit", {
	serverBanHitId: integer("server_ban_hit_id").primaryKey().generatedByDefaultAsIdentity(),
	banId: integer("ban_id").notNull().references(() => serverBan.serverBanId, { onDelete: "cascade" }),
	connectionId: integer("connection_id").notNull().references(() => connectionLog.connectionLogId, { onDelete: "cascade" }),
}, (table) => [
	index("IX_server_ban_hit_ban_id").using("btree", table.banId.asc().nullsLast()),
	index("IX_server_ban_hit_connection_id").using("btree", table.connectionId.asc().nullsLast()),
]);

export const serverRoleBan = pgTable("server_role_ban", {
	serverRoleBanId: integer("server_role_ban_id").primaryKey().generatedByDefaultAsIdentity(),
	playerUserId: uuid("player_user_id"),
	address: inet(),
	hwid: customType({ dataType: () => 'bytea' })(),
	banTime: timestamp("ban_time", { withTimezone: true }).notNull(),
	expirationTime: timestamp("expiration_time", { withTimezone: true }),
	reason: text().notNull(),
	banningAdmin: uuid("banning_admin").references(() => player.userId, { onDelete: "set null" }),
	roleId: text("role_id").notNull(),
	hidden: boolean().default(true).notNull(),
	lastEditedAt: timestamp("last_edited_at", { withTimezone: true }),
	lastEditedById: uuid("last_edited_by_id").references(() => player.userId, { onDelete: "set null" }),
	playtimeAtNote: interval("playtime_at_note").default("00:00:00").notNull(),
	roundId: integer("round_id").references(() => round.roundId),
	severity: integer().default(2).notNull(),
	hwidType: integer("hwid_type").default(0),
}, (table) => [
	index("IX_server_role_ban_address").using("btree", table.address.asc().nullsLast()),
	index("IX_server_role_ban_banning_admin").using("btree", table.banningAdmin.asc().nullsLast()),
	index("IX_server_role_ban_last_edited_by_id").using("btree", table.lastEditedById.asc().nullsLast()),
	index("IX_server_role_ban_player_user_id").using("btree", table.playerUserId.asc().nullsLast()),
	index("IX_server_role_ban_round_id").using("btree", table.roundId.asc().nullsLast()),
	check("CK_server_role_ban_AddressNotIPv6MappedIPv4", sql`(NOT ('::ffff:0.0.0.0/96'::inet >>= address))`), check("CK_server_role_ban_HaveEitherAddressOrUserIdOrHWId", sql`((address IS NOT NULL) OR (player_user_id IS NOT NULL) OR (hwid IS NOT NULL))`),]);

export const serverRoleUnban = pgTable("server_role_unban", {
	roleUnbanId: integer("role_unban_id").primaryKey().generatedByDefaultAsIdentity(),
	banId: integer("ban_id").notNull().references(() => serverRoleBan.serverRoleBanId, { onDelete: "cascade" }),
	unbanningAdmin: uuid("unbanning_admin"),
	unbanTime: timestamp("unban_time", { withTimezone: true }).notNull(),
}, (table) => [
	uniqueIndex("IX_server_role_unban_ban_id").using("btree", table.banId.asc().nullsLast()),
]);

export const serverUnban = pgTable("server_unban", {
	unbanId: integer("unban_id").primaryKey().generatedByDefaultAsIdentity(),
	banId: integer("ban_id").notNull().references(() => serverBan.serverBanId, { onDelete: "cascade" }),
	unbanningAdmin: uuid("unbanning_admin"),
	unbanTime: timestamp("unban_time", { withTimezone: true }).notNull(),
}, (table) => [
	uniqueIndex("IX_server_unban_ban_id").using("btree", table.banId.asc().nullsLast()),
]);

export const trait = pgTable("trait", {
	traitId: integer("trait_id").primaryKey().generatedByDefaultAsIdentity(),
	profileId: integer("profile_id").notNull().references(() => profile.profileId, { onDelete: "cascade" }),
	traitName: text("trait_name").notNull(),
}, (table) => [
	uniqueIndex("IX_trait_profile_id_trait_name").using("btree", table.profileId.asc().nullsLast(), table.traitName.asc().nullsLast()),
]);

export const uploadedResourceLog = pgTable("uploaded_resource_log", {
	uploadedResourceLogId: integer("uploaded_resource_log_id").primaryKey().generatedByDefaultAsIdentity(),
	date: timestamp({ withTimezone: true }).notNull(),
	userId: uuid("user_id").notNull(),
	path: text().notNull(),
	data: customType({ dataType: () => 'bytea' })().notNull(),
});

export const whitelist = pgTable("whitelist", {
	userId: uuid("user_id").primaryKey(),
});
