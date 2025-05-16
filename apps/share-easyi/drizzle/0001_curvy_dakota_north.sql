CREATE TABLE "messages_owner" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_owner_id" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"message_paged_id" integer NOT NULL,
	CONSTRAINT "messages_owner_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "messages_owner_message_paged_id_unique" UNIQUE("message_paged_id")
);
--> statement-breakpoint
CREATE TABLE "messagesPaged" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_paged_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"message_ids" integer[] DEFAULT ARRAY[]::integer[] NOT NULL,
	"prev_cursor" integer,
	"next_cursor" integer
);
--> statement-breakpoint
ALTER TABLE "messages_owner" ADD CONSTRAINT "messages_owner_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages_owner" ADD CONSTRAINT "messages_owner_message_paged_id_messagesPaged_id_fk" FOREIGN KEY ("message_paged_id") REFERENCES "public"."messagesPaged"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;