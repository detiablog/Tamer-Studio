import { relations } from "drizzle-orm/relations";
import { user, account, session, admin, adminSession } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const adminSessionRelations = relations(adminSession, ({one}) => ({
	admin: one(admin, {
		fields: [adminSession.adminId],
		references: [admin.id]
	}),
}));

export const adminRelations = relations(admin, ({many}) => ({
	adminSessions: many(adminSession),
}));