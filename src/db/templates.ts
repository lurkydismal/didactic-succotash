import { serial, text } from "drizzle-orm/pg-core";
import { metadata } from "./helpers";

export const template_table = {
    id: serial().primaryKey(),
    content: text().notNull(),
    ...metadata,
};
