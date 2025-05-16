import { relations } from "drizzle-orm/relations";
import { user, account, session, message, messagesOwner, messagesPaged } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	messages_senderId: many(message, {
		relationName: "message_senderId_user_id"
	}),
	messages_receiverId: many(message, {
		relationName: "message_receiverId_user_id"
	}),
	messagesOwners: many(messagesOwner),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const messageRelations = relations(message, ({one}) => ({
	user_senderId: one(user, {
		fields: [message.senderId],
		references: [user.id],
		relationName: "message_senderId_user_id"
	}),
	user_receiverId: one(user, {
		fields: [message.receiverId],
		references: [user.id],
		relationName: "message_receiverId_user_id"
	}),
}));

export const messagesOwnerRelations = relations(messagesOwner, ({one}) => ({
	user: one(user, {
		fields: [messagesOwner.userId],
		references: [user.id]
	}),
	messagesPaged: one(messagesPaged, {
		fields: [messagesOwner.messagePagedId],
		references: [messagesPaged.id]
	}),
}));

export const messagesPagedRelations = relations(messagesPaged, ({many}) => ({
	messagesOwners: many(messagesOwner),
}));