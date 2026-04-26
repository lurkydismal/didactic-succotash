CREATE TABLE "table" (
	"id" serial PRIMARY KEY,
	"content" text NOT NULL,
	"author" varchar(32) DEFAULT 'system' NOT NULL,
	"last_editor" varchar(32) DEFAULT 'system' NOT NULL,
	"updated_at" timestamp(0) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(0) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_not_blank" CHECK (length(trim("content")) > 0),
	CONSTRAINT "author_not_blank" CHECK (length(trim("author")) > 0),
	CONSTRAINT "last_editor_not_blank" CHECK (length(trim("last_editor")) > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"username" varchar(32) NOT NULL UNIQUE,
	"username_normalized" varchar(32) NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"updated_at" timestamp(0) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(0) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "username_not_blank" CHECK (length(trim("username")) > 0),
	CONSTRAINT "username_normalized_not_blank" CHECK (length(trim("username_normalized")) > 0),
	CONSTRAINT "username_normalized_lowercase" CHECK ("username_normalized" = lower("username_normalized"))
);
--> statement-breakpoint
ALTER TABLE "admin" RENAME CONSTRAINT "FK_admin_admin_rank_admin_rank_id" TO "admin_admin_rank_id_admin_rank_admin_rank_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_flag" RENAME CONSTRAINT "FK_admin_flag_admin_admin_id" TO "admin_flag_admin_id_admin_user_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_log" RENAME CONSTRAINT "FK_admin_log_round_round_id" TO "admin_log_round_id_round_round_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_log_player" RENAME CONSTRAINT "FK_admin_log_player_player_player_user_id" TO "admin_log_player_player_user_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_messages" RENAME CONSTRAINT "FK_admin_messages_round_round_id" TO "admin_messages_round_id_round_round_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_messages" RENAME CONSTRAINT "FK_admin_messages_player_player_user_id" TO "admin_messages_player_user_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_messages" RENAME CONSTRAINT "FK_admin_messages_player_created_by_id" TO "admin_messages_created_by_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_messages" RENAME CONSTRAINT "FK_admin_messages_player_last_edited_by_id" TO "admin_messages_last_edited_by_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_messages" RENAME CONSTRAINT "FK_admin_messages_player_deleted_by_id" TO "admin_messages_deleted_by_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_notes" RENAME CONSTRAINT "FK_admin_notes_round_round_id" TO "admin_notes_round_id_round_round_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_notes" RENAME CONSTRAINT "FK_admin_notes_player_player_user_id" TO "admin_notes_player_user_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_notes" RENAME CONSTRAINT "FK_admin_notes_player_created_by_id" TO "admin_notes_created_by_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_notes" RENAME CONSTRAINT "FK_admin_notes_player_last_edited_by_id" TO "admin_notes_last_edited_by_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_notes" RENAME CONSTRAINT "FK_admin_notes_player_deleted_by_id" TO "admin_notes_deleted_by_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_rank_flag" RENAME CONSTRAINT "FK_admin_rank_flag_admin_rank_admin_rank_id" TO "admin_rank_flag_admin_rank_id_admin_rank_admin_rank_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_watchlists" RENAME CONSTRAINT "FK_admin_watchlists_round_round_id" TO "admin_watchlists_round_id_round_round_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_watchlists" RENAME CONSTRAINT "FK_admin_watchlists_player_player_user_id" TO "admin_watchlists_player_user_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_watchlists" RENAME CONSTRAINT "FK_admin_watchlists_player_created_by_id" TO "admin_watchlists_created_by_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_watchlists" RENAME CONSTRAINT "FK_admin_watchlists_player_last_edited_by_id" TO "admin_watchlists_last_edited_by_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "admin_watchlists" RENAME CONSTRAINT "FK_admin_watchlists_player_deleted_by_id" TO "admin_watchlists_deleted_by_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "antag" RENAME CONSTRAINT "FK_antag_profile_profile_id" TO "antag_profile_id_profile_profile_id_fkey";--> statement-breakpoint
ALTER TABLE "connection_log" RENAME CONSTRAINT "FK_connection_log_server_server_id" TO "connection_log_server_id_server_server_id_fkey";--> statement-breakpoint
ALTER TABLE "job" RENAME CONSTRAINT "FK_job_profile_profile_id" TO "job_profile_id_profile_profile_id_fkey";--> statement-breakpoint
ALTER TABLE "player_round" RENAME CONSTRAINT "FK_player_round_player_players_id" TO "player_round_players_id_player_player_id_fkey";--> statement-breakpoint
ALTER TABLE "player_round" RENAME CONSTRAINT "FK_player_round_round_rounds_id" TO "player_round_rounds_id_round_round_id_fkey";--> statement-breakpoint
ALTER TABLE "profile" RENAME CONSTRAINT "FK_profile_preference_preference_id" TO "profile_preference_id_preference_preference_id_fkey";--> statement-breakpoint
ALTER TABLE "profile_loadout" RENAME CONSTRAINT "FK_profile_loadout_profile_loadout_group_profile_loadout_group~" TO "profile_loadout_yRwBphGLhtsb_fkey";--> statement-breakpoint
ALTER TABLE "profile_loadout_group" RENAME CONSTRAINT "FK_profile_loadout_group_profile_role_loadout_profile_role_loa~" TO "profile_loadout_group_nWsGFsJBkb10_fkey";--> statement-breakpoint
ALTER TABLE "profile_role_loadout" RENAME CONSTRAINT "FK_profile_role_loadout_profile_profile_id" TO "profile_role_loadout_profile_id_profile_profile_id_fkey";--> statement-breakpoint
ALTER TABLE "rmc_linked_accounts" RENAME CONSTRAINT "FK_rmc_linked_accounts_player_player_id" TO "rmc_linked_accounts_player_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "rmc_linked_accounts" RENAME CONSTRAINT "FK_rmc_linked_accounts_rmc_discord_accounts_discord_id" TO "rmc_linked_accounts_diTJsSyqBqC6_fkey";--> statement-breakpoint
ALTER TABLE "rmc_linked_accounts_logs" RENAME CONSTRAINT "FK_rmc_linked_accounts_logs_player_player_id1" TO "rmc_linked_accounts_logs_player_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "rmc_linked_accounts_logs" RENAME CONSTRAINT "FK_rmc_linked_accounts_logs_rmc_discord_accounts_discord_id" TO "rmc_linked_accounts_logs_Z2uN5FWHfxDU_fkey";--> statement-breakpoint
ALTER TABLE "rmc_linking_codes" RENAME CONSTRAINT "FK_rmc_linking_codes_player_player_id" TO "rmc_linking_codes_player_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "rmc_patron_lobby_messages" RENAME CONSTRAINT "FK_rmc_patron_lobby_messages_rmc_patrons_patron_id" TO "rmc_patron_lobby_messages_patron_id_rmc_patrons_player_id_fkey";--> statement-breakpoint
ALTER TABLE "rmc_patron_round_end_nt_shoutouts" RENAME CONSTRAINT "FK_rmc_patron_round_end_nt_shoutouts_rmc_patrons_patron_id" TO "rmc_patron_round_end_nt_shoutouts_t6m1VavOtZyg_fkey";--> statement-breakpoint
ALTER TABLE "rmc_patrons" RENAME CONSTRAINT "FK_rmc_patrons_player_player_id" TO "rmc_patrons_player_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "rmc_patrons" RENAME CONSTRAINT "FK_rmc_patrons_rmc_patron_tiers_tier_id" TO "rmc_patrons_tier_id_rmc_patron_tiers_rmc_patron_tiers_id_fkey";--> statement-breakpoint
ALTER TABLE "role_whitelists" RENAME CONSTRAINT "FK_role_whitelists_player_player_user_id" TO "role_whitelists_player_user_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "round" RENAME CONSTRAINT "FK_round_server_server_id" TO "round_server_id_server_server_id_fkey";--> statement-breakpoint
ALTER TABLE "server_ban" RENAME CONSTRAINT "FK_server_ban_player_banning_admin" TO "server_ban_banning_admin_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "server_ban" RENAME CONSTRAINT "FK_server_ban_player_last_edited_by_id" TO "server_ban_last_edited_by_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "server_ban" RENAME CONSTRAINT "FK_server_ban_round_round_id" TO "server_ban_round_id_round_round_id_fkey";--> statement-breakpoint
ALTER TABLE "server_ban_hit" RENAME CONSTRAINT "FK_server_ban_hit_server_ban_ban_id" TO "server_ban_hit_ban_id_server_ban_server_ban_id_fkey";--> statement-breakpoint
ALTER TABLE "server_ban_hit" RENAME CONSTRAINT "FK_server_ban_hit_connection_log_connection_id" TO "server_ban_hit_j6KWjm0ZFgYQ_fkey";--> statement-breakpoint
ALTER TABLE "server_role_ban" RENAME CONSTRAINT "FK_server_role_ban_player_banning_admin" TO "server_role_ban_banning_admin_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "server_role_ban" RENAME CONSTRAINT "FK_server_role_ban_player_last_edited_by_id" TO "server_role_ban_last_edited_by_id_player_user_id_fkey";--> statement-breakpoint
ALTER TABLE "server_role_ban" RENAME CONSTRAINT "FK_server_role_ban_round_round_id" TO "server_role_ban_round_id_round_round_id_fkey";--> statement-breakpoint
ALTER TABLE "server_role_unban" RENAME CONSTRAINT "FK_server_role_unban_server_role_ban_ban_id" TO "server_role_unban_uV9LcZzaWf8j_fkey";--> statement-breakpoint
ALTER TABLE "server_unban" RENAME CONSTRAINT "FK_server_unban_server_ban_ban_id" TO "server_unban_ban_id_server_ban_server_ban_id_fkey";--> statement-breakpoint
ALTER TABLE "trait" RENAME CONSTRAINT "FK_trait_profile_profile_id" TO "trait_profile_id_profile_profile_id_fkey";--> statement-breakpoint
ALTER TABLE "admin" RENAME CONSTRAINT "PK_admin" TO "admin_pkey";--> statement-breakpoint
ALTER TABLE "admin_flag" RENAME CONSTRAINT "PK_admin_flag" TO "admin_flag_pkey";--> statement-breakpoint
ALTER TABLE "admin_messages" RENAME CONSTRAINT "PK_admin_messages" TO "admin_messages_pkey";--> statement-breakpoint
ALTER TABLE "admin_notes" RENAME CONSTRAINT "PK_admin_notes" TO "admin_notes_pkey";--> statement-breakpoint
ALTER TABLE "admin_rank" RENAME CONSTRAINT "PK_admin_rank" TO "admin_rank_pkey";--> statement-breakpoint
ALTER TABLE "admin_rank_flag" RENAME CONSTRAINT "PK_admin_rank_flag" TO "admin_rank_flag_pkey";--> statement-breakpoint
ALTER TABLE "admin_watchlists" RENAME CONSTRAINT "PK_admin_watchlists" TO "admin_watchlists_pkey";--> statement-breakpoint
ALTER TABLE "antag" RENAME CONSTRAINT "PK_antag" TO "antag_pkey";--> statement-breakpoint
ALTER TABLE "assigned_user_id" RENAME CONSTRAINT "PK_assigned_user_id" TO "assigned_user_id_pkey";--> statement-breakpoint
ALTER TABLE "ban_template" RENAME CONSTRAINT "PK_ban_template" TO "ban_template_pkey";--> statement-breakpoint
ALTER TABLE "blacklist" RENAME CONSTRAINT "PK_blacklist" TO "blacklist_pkey";--> statement-breakpoint
ALTER TABLE "connection_log" RENAME CONSTRAINT "PK_connection_log" TO "connection_log_pkey";--> statement-breakpoint
ALTER TABLE "__EFMigrationsHistory" RENAME CONSTRAINT "PK___EFMigrationsHistory" TO "__EFMigrationsHistory_pkey";--> statement-breakpoint
ALTER TABLE "ipintel_cache" RENAME CONSTRAINT "PK_ipintel_cache" TO "ipintel_cache_pkey";--> statement-breakpoint
ALTER TABLE "job" RENAME CONSTRAINT "PK_job" TO "job_pkey";--> statement-breakpoint
ALTER TABLE "play_time" RENAME CONSTRAINT "PK_play_time" TO "play_time_pkey";--> statement-breakpoint
ALTER TABLE "player" RENAME CONSTRAINT "PK_player" TO "player_pkey";--> statement-breakpoint
ALTER TABLE "preference" RENAME CONSTRAINT "PK_preference" TO "preference_pkey";--> statement-breakpoint
ALTER TABLE "profile" RENAME CONSTRAINT "PK_profile" TO "profile_pkey";--> statement-breakpoint
ALTER TABLE "profile_loadout" RENAME CONSTRAINT "PK_profile_loadout" TO "profile_loadout_pkey";--> statement-breakpoint
ALTER TABLE "profile_loadout_group" RENAME CONSTRAINT "PK_profile_loadout_group" TO "profile_loadout_group_pkey";--> statement-breakpoint
ALTER TABLE "profile_role_loadout" RENAME CONSTRAINT "PK_profile_role_loadout" TO "profile_role_loadout_pkey";--> statement-breakpoint
ALTER TABLE "rmc_discord_accounts" RENAME CONSTRAINT "PK_rmc_discord_accounts" TO "rmc_discord_accounts_pkey";--> statement-breakpoint
ALTER TABLE "rmc_linked_accounts" RENAME CONSTRAINT "PK_rmc_linked_accounts" TO "rmc_linked_accounts_pkey";--> statement-breakpoint
ALTER TABLE "rmc_linked_accounts_logs" RENAME CONSTRAINT "PK_rmc_linked_accounts_logs" TO "rmc_linked_accounts_logs_pkey";--> statement-breakpoint
ALTER TABLE "rmc_linking_codes" RENAME CONSTRAINT "PK_rmc_linking_codes" TO "rmc_linking_codes_pkey";--> statement-breakpoint
ALTER TABLE "rmc_patron_lobby_messages" RENAME CONSTRAINT "PK_rmc_patron_lobby_messages" TO "rmc_patron_lobby_messages_pkey";--> statement-breakpoint
ALTER TABLE "rmc_patron_round_end_nt_shoutouts" RENAME CONSTRAINT "PK_rmc_patron_round_end_nt_shoutouts" TO "rmc_patron_round_end_nt_shoutouts_pkey";--> statement-breakpoint
ALTER TABLE "rmc_patron_tiers" RENAME CONSTRAINT "PK_rmc_patron_tiers" TO "rmc_patron_tiers_pkey";--> statement-breakpoint
ALTER TABLE "rmc_patrons" RENAME CONSTRAINT "PK_rmc_patrons" TO "rmc_patrons_pkey";--> statement-breakpoint
ALTER TABLE "round" RENAME CONSTRAINT "PK_round" TO "round_pkey";--> statement-breakpoint
ALTER TABLE "server" RENAME CONSTRAINT "PK_server" TO "server_pkey";--> statement-breakpoint
ALTER TABLE "server_ban" RENAME CONSTRAINT "PK_server_ban" TO "server_ban_pkey";--> statement-breakpoint
ALTER TABLE "server_ban_exemption" RENAME CONSTRAINT "PK_server_ban_exemption" TO "server_ban_exemption_pkey";--> statement-breakpoint
ALTER TABLE "server_ban_hit" RENAME CONSTRAINT "PK_server_ban_hit" TO "server_ban_hit_pkey";--> statement-breakpoint
ALTER TABLE "server_role_ban" RENAME CONSTRAINT "PK_server_role_ban" TO "server_role_ban_pkey";--> statement-breakpoint
ALTER TABLE "server_role_unban" RENAME CONSTRAINT "PK_server_role_unban" TO "server_role_unban_pkey";--> statement-breakpoint
ALTER TABLE "server_unban" RENAME CONSTRAINT "PK_server_unban" TO "server_unban_pkey";--> statement-breakpoint
ALTER TABLE "trait" RENAME CONSTRAINT "PK_trait" TO "trait_pkey";--> statement-breakpoint
ALTER TABLE "uploaded_resource_log" RENAME CONSTRAINT "PK_uploaded_resource_log" TO "uploaded_resource_log_pkey";--> statement-breakpoint
ALTER TABLE "whitelist" RENAME CONSTRAINT "PK_whitelist" TO "whitelist_pkey";--> statement-breakpoint
ALTER TABLE "rmc_patron_tiers" ALTER COLUMN "discord_role" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "preference" ALTER COLUMN "construction_favorites" SET DEFAULT ARRAY::text[];--> statement-breakpoint
CREATE UNIQUE INDEX "table_created_at_index" ON "table" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "table_updated_at_index" ON "table" ("updated_at");