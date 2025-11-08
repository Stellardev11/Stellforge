CREATE TABLE "mint_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"total_supply" numeric(20, 2) DEFAULT '100000000' NOT NULL,
	"point_holders_allocation_percent" numeric(5, 2) DEFAULT '60' NOT NULL,
	"listing_reserve_percent" numeric(5, 2) DEFAULT '15' NOT NULL,
	"team_percent" numeric(5, 2) DEFAULT '15' NOT NULL,
	"launch_percent" numeric(5, 2) DEFAULT '5' NOT NULL,
	"other_percent" numeric(5, 2) DEFAULT '5' NOT NULL,
	"minting_active" boolean DEFAULT true NOT NULL,
	"treasury_wallet_address" text,
	"total_xlm_received" numeric(20, 7) DEFAULT '0' NOT NULL,
	"total_p_slf_minted" numeric(20, 2) DEFAULT '0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "point_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"wallet_address" text NOT NULL,
	"p_slf_points" numeric(20, 2) DEFAULT '0' NOT NULL,
	"points_earned_from_minting" numeric(20, 2) DEFAULT '0' NOT NULL,
	"points_earned_from_platform" numeric(20, 2) DEFAULT '0' NOT NULL,
	"points_earned_from_referrals" numeric(20, 2) DEFAULT '0' NOT NULL,
	"points_earned_from_tasks" numeric(20, 2) DEFAULT '0' NOT NULL,
	"initial_bonus_received" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "point_balances_wallet_id_unique" UNIQUE("wallet_id"),
	CONSTRAINT "point_balances_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE "point_mints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"wallet_address" text NOT NULL,
	"xlm_amount" numeric(20, 7) NOT NULL,
	"p_slf_points_awarded" numeric(20, 2) NOT NULL,
	"transaction_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_wallet_id" uuid NOT NULL,
	"referee_wallet_id" uuid NOT NULL,
	"referral_code" text NOT NULL,
	"ip_address" text,
	"device_fingerprint" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"points_awarded" numeric(20, 2) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "referral_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"wallet_address" text NOT NULL,
	"referral_code" text NOT NULL,
	"total_referrals" integer DEFAULT 0 NOT NULL,
	"successful_referrals" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_links_wallet_id_unique" UNIQUE("wallet_id"),
	CONSTRAINT "referral_links_wallet_address_unique" UNIQUE("wallet_address"),
	CONSTRAINT "referral_links_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "security_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" text,
	"ip_address" text,
	"device_fingerprint" text,
	"action" text NOT NULL,
	"details" jsonb,
	"flagged" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"wallet_address" text NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"points_awarded" numeric(20, 2) NOT NULL,
	"proof_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"p_slf_reward" numeric(20, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"max_completions" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"wallet_address" text NOT NULL,
	"transaction_hash" text NOT NULL,
	"xlm_spent" numeric(20, 7) NOT NULL,
	"p_slf_points_awarded" numeric(20, 2) NOT NULL,
	"transaction_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"total_users" integer DEFAULT 0 NOT NULL,
	"users_with_initial_bonus" integer DEFAULT 0 NOT NULL,
	"total_p_slf_distributed" numeric(20, 2) DEFAULT '0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"received_initial_bonus" boolean DEFAULT false NOT NULL,
	"total_points_earned" numeric(20, 2) DEFAULT '0' NOT NULL,
	"last_activity_at" timestamp DEFAULT now(),
	CONSTRAINT "wallets_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
ALTER TABLE "point_balances" ADD CONSTRAINT "point_balances_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_mints" ADD CONSTRAINT "point_mints_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referrer_wallet_id_wallets_id_fk" FOREIGN KEY ("referrer_wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_events" ADD CONSTRAINT "referral_events_referee_wallet_id_wallets_id_fk" FOREIGN KEY ("referee_wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_links" ADD CONSTRAINT "referral_links_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_rewards" ADD CONSTRAINT "transaction_rewards_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "points_wallet_id_idx" ON "point_balances" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "mint_wallet_id_idx" ON "point_mints" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "mint_tx_hash_idx" ON "point_mints" USING btree ("transaction_hash");--> statement-breakpoint
CREATE INDEX "referrer_wallet_id_idx" ON "referral_events" USING btree ("referrer_wallet_id");--> statement-breakpoint
CREATE INDEX "referee_wallet_id_idx" ON "referral_events" USING btree ("referee_wallet_id");--> statement-breakpoint
CREATE INDEX "ip_address_idx" ON "referral_events" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "referral_code_idx" ON "referral_links" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "audit_wallet_idx" ON "security_audit_logs" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "audit_ip_idx" ON "security_audit_logs" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "audit_flagged_idx" ON "security_audit_logs" USING btree ("flagged");--> statement-breakpoint
CREATE UNIQUE INDEX "task_wallet_unique_idx" ON "task_completions" USING btree ("task_id","wallet_id");--> statement-breakpoint
CREATE INDEX "task_comp_wallet_idx" ON "task_completions" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "tx_rewards_wallet_id_idx" ON "transaction_rewards" USING btree ("wallet_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tx_hash_idx" ON "transaction_rewards" USING btree ("transaction_hash");