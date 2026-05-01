import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	admin: {
		adminRank: r.one.adminRank({
			from: r.admin.adminRankId,
			to: r.adminRank.adminRankId
		}),
		adminFlags: r.many.adminFlag(),
	},
	adminRank: {
		admins: r.many.admin(),
		adminRankFlags: r.many.adminRankFlag(),
	},
	adminFlag: {
		admin: r.one.admin({
			from: r.adminFlag.adminId,
			to: r.admin.userId
		}),
	},
	adminLog: {
		round: r.one.round({
			from: r.adminLog.roundId,
			to: r.round.roundId
		}),
		players: r.many.player({
			from: [
				r.adminLog.roundId.through(r.adminLogPlayer.roundId),
				r.adminLog.adminLogId.through(r.adminLogPlayer.logId),
			],
			to: r.player.userId.through(r.adminLogPlayer.playerUserId)
		}),
	},
	round: {
		adminLogs: r.many.adminLog(),
		adminMessages: r.many.adminMessages(),
		adminNotes: r.many.adminNotes(),
		adminWatchlists: r.many.adminWatchlists(),
		players: r.many.player(),
		server: r.one.server({
			from: r.round.serverId,
			to: r.server.serverId
		}),
		serverBans: r.many.serverBan(),
		serverRoleBans: r.many.serverRoleBan(),
	},
	player: {
		adminLogs: r.many.adminLog(),
		adminMessagesCreatedById: r.many.adminMessages({
			alias: "adminMessages_createdById_player_userId"
		}),
		adminMessagesDeletedById: r.many.adminMessages({
			alias: "adminMessages_deletedById_player_userId"
		}),
		adminMessagesLastEditedById: r.many.adminMessages({
			alias: "adminMessages_lastEditedById_player_userId"
		}),
		adminMessagesPlayerUserId: r.many.adminMessages({
			alias: "adminMessages_playerUserId_player_userId"
		}),
		adminNotesCreatedById: r.many.adminNotes({
			alias: "adminNotes_createdById_player_userId"
		}),
		adminNotesDeletedById: r.many.adminNotes({
			alias: "adminNotes_deletedById_player_userId"
		}),
		adminNotesLastEditedById: r.many.adminNotes({
			alias: "adminNotes_lastEditedById_player_userId"
		}),
		adminNotesPlayerUserId: r.many.adminNotes({
			alias: "adminNotes_playerUserId_player_userId"
		}),
		adminWatchlistsCreatedById: r.many.adminWatchlists({
			alias: "adminWatchlists_createdById_player_userId"
		}),
		adminWatchlistsDeletedById: r.many.adminWatchlists({
			alias: "adminWatchlists_deletedById_player_userId"
		}),
		adminWatchlistsLastEditedById: r.many.adminWatchlists({
			alias: "adminWatchlists_lastEditedById_player_userId"
		}),
		adminWatchlistsPlayerUserId: r.many.adminWatchlists({
			alias: "adminWatchlists_playerUserId_player_userId"
		}),
		rounds: r.many.round({
			from: r.player.playerId.through(r.playerRound.playersId),
			to: r.round.roundId.through(r.playerRound.roundsId)
		}),
		rmcDiscordAccountsViaRmcLinkedAccounts: r.many.rmcDiscordAccounts({
			from: r.player.userId.through(r.rmcLinkedAccounts.playerId),
			to: r.rmcDiscordAccounts.rmcDiscordAccountsId.through(r.rmcLinkedAccounts.discordId),
			alias: "player_userId_rmcDiscordAccounts_rmcDiscordAccountsId_via_rmcLinkedAccounts"
		}),
		rmcDiscordAccountsViaRmcLinkedAccountsLogs: r.many.rmcDiscordAccounts({
			from: r.player.userId.through(r.rmcLinkedAccountsLogs.playerId),
			to: r.rmcDiscordAccounts.rmcDiscordAccountsId.through(r.rmcLinkedAccountsLogs.discordId),
			alias: "player_userId_rmcDiscordAccounts_rmcDiscordAccountsId_via_rmcLinkedAccountsLogs"
		}),
		rmcLinkingCodes: r.many.rmcLinkingCodes(),
		rmcPatronTiers: r.many.rmcPatronTiers({
			from: r.player.userId.through(r.rmcPatrons.playerId),
			to: r.rmcPatronTiers.rmcPatronTiersId.through(r.rmcPatrons.tierId)
		}),
		roleWhitelists: r.many.roleWhitelists(),
		serverBansBanningAdmin: r.many.serverBan({
			alias: "serverBan_banningAdmin_player_userId"
		}),
		serverBansLastEditedById: r.many.serverBan({
			alias: "serverBan_lastEditedById_player_userId"
		}),
		serverRoleBansBanningAdmin: r.many.serverRoleBan({
			alias: "serverRoleBan_banningAdmin_player_userId"
		}),
		serverRoleBansLastEditedById: r.many.serverRoleBan({
			alias: "serverRoleBan_lastEditedById_player_userId"
		}),
	},
	adminMessages: {
		playerCreatedById: r.one.player({
			from: r.adminMessages.createdById,
			to: r.player.userId,
			alias: "adminMessages_createdById_player_userId"
		}),
		playerDeletedById: r.one.player({
			from: r.adminMessages.deletedById,
			to: r.player.userId,
			alias: "adminMessages_deletedById_player_userId"
		}),
		playerLastEditedById: r.one.player({
			from: r.adminMessages.lastEditedById,
			to: r.player.userId,
			alias: "adminMessages_lastEditedById_player_userId"
		}),
		playerPlayerUserId: r.one.player({
			from: r.adminMessages.playerUserId,
			to: r.player.userId,
			alias: "adminMessages_playerUserId_player_userId"
		}),
		round: r.one.round({
			from: r.adminMessages.roundId,
			to: r.round.roundId
		}),
	},
	adminNotes: {
		playerCreatedById: r.one.player({
			from: r.adminNotes.createdById,
			to: r.player.userId,
			alias: "adminNotes_createdById_player_userId"
		}),
		playerDeletedById: r.one.player({
			from: r.adminNotes.deletedById,
			to: r.player.userId,
			alias: "adminNotes_deletedById_player_userId"
		}),
		playerLastEditedById: r.one.player({
			from: r.adminNotes.lastEditedById,
			to: r.player.userId,
			alias: "adminNotes_lastEditedById_player_userId"
		}),
		playerPlayerUserId: r.one.player({
			from: r.adminNotes.playerUserId,
			to: r.player.userId,
			alias: "adminNotes_playerUserId_player_userId"
		}),
		round: r.one.round({
			from: r.adminNotes.roundId,
			to: r.round.roundId
		}),
	},
	adminRankFlag: {
		adminRank: r.one.adminRank({
			from: r.adminRankFlag.adminRankId,
			to: r.adminRank.adminRankId
		}),
	},
	adminWatchlists: {
		playerCreatedById: r.one.player({
			from: r.adminWatchlists.createdById,
			to: r.player.userId,
			alias: "adminWatchlists_createdById_player_userId"
		}),
		playerDeletedById: r.one.player({
			from: r.adminWatchlists.deletedById,
			to: r.player.userId,
			alias: "adminWatchlists_deletedById_player_userId"
		}),
		playerLastEditedById: r.one.player({
			from: r.adminWatchlists.lastEditedById,
			to: r.player.userId,
			alias: "adminWatchlists_lastEditedById_player_userId"
		}),
		playerPlayerUserId: r.one.player({
			from: r.adminWatchlists.playerUserId,
			to: r.player.userId,
			alias: "adminWatchlists_playerUserId_player_userId"
		}),
		round: r.one.round({
			from: r.adminWatchlists.roundId,
			to: r.round.roundId
		}),
	},
	antag: {
		profile: r.one.profile({
			from: r.antag.profileId,
			to: r.profile.profileId
		}),
	},
	profile: {
		antags: r.many.antag(),
		jobs: r.many.job(),
		preferences: r.many.preference({
			alias: "preference_selectedCharacterSlot_preferenceId_profile_slot_preferenceId"
		}),
		preference: r.one.preference({
			from: r.profile.preferenceId,
			to: r.preference.preferenceId,
			alias: "profile_preferenceId_preference_preferenceId"
		}),
		profileRoleLoadouts: r.many.profileRoleLoadout(),
		traits: r.many.trait(),
	},
	connectionLog: {
		server: r.one.server({
			from: r.connectionLog.serverId,
			to: r.server.serverId
		}),
		serverBans: r.many.serverBan({
			from: r.connectionLog.connectionLogId.through(r.serverBanHit.connectionId),
			to: r.serverBan.serverBanId.through(r.serverBanHit.banId)
		}),
	},
	server: {
		connectionLogs: r.many.connectionLog(),
		rounds: r.many.round(),
	},
	job: {
		profile: r.one.profile({
			from: r.job.profileId,
			to: r.profile.profileId
		}),
	},
	preference: {
		profile: r.one.profile({
			from: [r.preference.selectedCharacterSlot, r.preference.preferenceId],
			to: [r.profile.slot, r.profile.preferenceId],
			alias: "preference_selectedCharacterSlot_preferenceId_profile_slot_preferenceId"
		}),
		profiles: r.many.profile({
			alias: "profile_preferenceId_preference_preferenceId"
		}),
	},
	profileLoadout: {
		profileLoadoutGroup: r.one.profileLoadoutGroup({
			from: r.profileLoadout.profileLoadoutGroupId,
			to: r.profileLoadoutGroup.profileLoadoutGroupId
		}),
	},
	profileLoadoutGroup: {
		profileLoadouts: r.many.profileLoadout(),
		profileRoleLoadout: r.one.profileRoleLoadout({
			from: r.profileLoadoutGroup.profileRoleLoadoutId,
			to: r.profileRoleLoadout.profileRoleLoadoutId
		}),
	},
	profileRoleLoadout: {
		profileLoadoutGroups: r.many.profileLoadoutGroup(),
		profile: r.one.profile({
			from: r.profileRoleLoadout.profileId,
			to: r.profile.profileId
		}),
	},
	rmcDiscordAccounts: {
		playersViaRmcLinkedAccounts: r.many.player({
			alias: "player_userId_rmcDiscordAccounts_rmcDiscordAccountsId_via_rmcLinkedAccounts"
		}),
		playersViaRmcLinkedAccountsLogs: r.many.player({
			alias: "player_userId_rmcDiscordAccounts_rmcDiscordAccountsId_via_rmcLinkedAccountsLogs"
		}),
	},
	rmcLinkingCodes: {
		player: r.one.player({
			from: r.rmcLinkingCodes.playerId,
			to: r.player.userId
		}),
	},
	rmcPatronLobbyMessages: {
		rmcPatron: r.one.rmcPatrons({
			from: r.rmcPatronLobbyMessages.patronId,
			to: r.rmcPatrons.playerId
		}),
	},
	rmcPatrons: {
		rmcPatronLobbyMessages: r.many.rmcPatronLobbyMessages(),
		rmcPatronRoundEndNtShoutouts: r.many.rmcPatronRoundEndNtShoutouts(),
	},
	rmcPatronRoundEndNtShoutouts: {
		rmcPatron: r.one.rmcPatrons({
			from: r.rmcPatronRoundEndNtShoutouts.patronId,
			to: r.rmcPatrons.playerId
		}),
	},
	rmcPatronTiers: {
		players: r.many.player(),
	},
	roleWhitelists: {
		player: r.one.player({
			from: r.roleWhitelists.playerUserId,
			to: r.player.userId
		}),
	},
	serverBan: {
		playerBanningAdmin: r.one.player({
			from: r.serverBan.banningAdmin,
			to: r.player.userId,
			alias: "serverBan_banningAdmin_player_userId"
		}),
		playerLastEditedById: r.one.player({
			from: r.serverBan.lastEditedById,
			to: r.player.userId,
			alias: "serverBan_lastEditedById_player_userId"
		}),
		round: r.one.round({
			from: r.serverBan.roundId,
			to: r.round.roundId
		}),
		connectionLogs: r.many.connectionLog(),
		serverUnbans: r.many.serverUnban(),
	},
	serverRoleBan: {
		playerBanningAdmin: r.one.player({
			from: r.serverRoleBan.banningAdmin,
			to: r.player.userId,
			alias: "serverRoleBan_banningAdmin_player_userId"
		}),
		playerLastEditedById: r.one.player({
			from: r.serverRoleBan.lastEditedById,
			to: r.player.userId,
			alias: "serverRoleBan_lastEditedById_player_userId"
		}),
		round: r.one.round({
			from: r.serverRoleBan.roundId,
			to: r.round.roundId
		}),
		serverRoleUnbans: r.many.serverRoleUnban(),
	},
	serverRoleUnban: {
		serverRoleBan: r.one.serverRoleBan({
			from: r.serverRoleUnban.banId,
			to: r.serverRoleBan.serverRoleBanId
		}),
	},
	serverUnban: {
		serverBan: r.one.serverBan({
			from: r.serverUnban.banId,
			to: r.serverBan.serverBanId
		}),
	},
	trait: {
		profile: r.one.profile({
			from: r.trait.profileId,
			to: r.profile.profileId
		}),
	},
}))