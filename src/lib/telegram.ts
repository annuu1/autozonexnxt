
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export const TelegramBot = {
    async generateInviteLink(chatId: string | number, memberLimit = 1, expireDate?: number) {
        if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not defined");

        const url = `${TELEGRAM_API_BASE}/createChatInviteLink`;
        const body: any = {
            chat_id: chatId,
            member_limit: memberLimit, // Single use by default
        };

        if (expireDate) {
            body.expire_date = expireDate;
        }

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        if (!data.ok) {
            throw new Error(`Telegram API Error: ${data.description}`);
        }

        return data.result.invite_link;
    },

    async kickChatMember(chatId: string | number, userId: number | string) {
        if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not defined");

        const url = `${TELEGRAM_API_BASE}/banChatMember`; // banChatMember kicks and bans. 
        // To just kick (allow rejoin), we ban then unban.

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                user_id: userId,
            }),
        });

        const data = await res.json();
        if (!data.ok) {
            throw new Error(`Telegram API Error: ${data.description}`);
        }

        return true;
    },

    async unbanChatMember(chatId: string | number, userId: number | string) {
        if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not defined");

        const url = `${TELEGRAM_API_BASE}/unbanChatMember`;

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                user_id: userId,
                only_if_banned: true
            }),
        });

        const data = await res.json();
        if (!data.ok) {
            // Ignore if not banned or other minor issues might be okay, but let's throw for now
            throw new Error(`Telegram API Error: ${data.description}`);
        }

        return true;
    },

    async getChatMember(chatId: string | number, userId: number | string) {
        if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not defined");

        const url = `${TELEGRAM_API_BASE}/getChatMember?chat_id=${chatId}&user_id=${userId}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.ok) {
            return null; // User not found or other error
        }

        return data.result; // returns ChatMember object (status: creator, administrator, member, restricted, left, kicked)
    },

    async resolveTelegramId(username: string): Promise<number | null> {
        if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not defined");

        // Clean username
        const targetUsername = username.replace(/^@/, '').toLowerCase();

        const url = `${TELEGRAM_API_BASE}/getUpdates`;
        try {
            const res = await fetch(url);
            const data = await res.json();

            if (!data.ok) return null;

            // Look through updates for a matching username
            for (const update of data.result) {
                const message = update.message || update.edited_message || update.channel_post;
                const fromUser = message?.from || update.chat_member?.new_chat_member?.user || update.my_chat_member?.from;

                if (fromUser && fromUser.username && fromUser.username.toLowerCase() === targetUsername) {
                    return fromUser.id;
                }
            }
            return null;
        } catch (e) {
            console.error("Error resolving Telegram ID:", e);
            return null;
        }
    }
};
