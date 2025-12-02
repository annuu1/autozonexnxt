import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { TelegramBot } from "@/lib/telegram";

const TELEGRAM_GROUP_ID = "-1003120757956";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { userId, action, status } = await req.json(); // action: 'add' | 'remove' | 'check' | 'resolve' | 'update_status'

        if (!userId || !action) {
            return NextResponse.json(
                { success: false, error: "Missing userId or action" },
                { status: 400 }
            );
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        let result: any = {};

        // Helper to find Telegram ID/Username from user record
        const getTelegramInfo = () => {
            const channel = user.other_channels?.find((c: any) => c.channel === "telegramUsername" || c.channel === "telegram");
            // Check if the 'id' field is actually a numeric ID (stringified) or a username
            // If it contains letters, it's likely a username/string ID. If it's all digits, it's likely a numeric ID.
            const idVal = channel?.id;
            const isNumeric = /^\d+$/.test(idVal);

            return {
                storedId: idVal,
                isNumeric,
                username: !isNumeric ? idVal : user.telegramUsername || channel?.channel === "telegramUsername" ? idVal : undefined
            };
        };

        if (action === "add") {
            // ... (Existing Add Logic) ...
            let expiryDate = user.subscription?.endDate;
            if (!expiryDate && user.subscription?.startDate && user.subscription?.billingCycle) {
                const startDate = new Date(user.subscription.startDate);
                const cycle = user.subscription.billingCycle.toLowerCase();
                let calculatedEndDate = new Date(startDate);
                switch (cycle) {
                    case 'daily': calculatedEndDate.setDate(startDate.getDate() + 1); break;
                    case 'weekly': calculatedEndDate.setDate(startDate.getDate() + 7); break;
                    case 'monthly': calculatedEndDate.setMonth(startDate.getMonth() + 1); break;
                    case 'quarterly': calculatedEndDate.setMonth(startDate.getMonth() + 3); break;
                    case 'halfyearly': calculatedEndDate.setMonth(startDate.getMonth() + 6); break;
                    case 'yearly': calculatedEndDate.setFullYear(startDate.getFullYear() + 1); break;
                    default: calculatedEndDate.setMonth(startDate.getMonth() + 1);
                }
                expiryDate = calculatedEndDate;
            }

            let telegramExpiryTimestamp: number | undefined;
            if (expiryDate) {
                const now = new Date();
                if (expiryDate > now) {
                    telegramExpiryTimestamp = Math.floor(expiryDate.getTime() / 1000);
                }
            }

            const inviteLink = await TelegramBot.generateInviteLink(TELEGRAM_GROUP_ID, 1, telegramExpiryTimestamp);

            result.inviteLink = inviteLink;
            result.message = "Invite link generated";

            if (!user.subscription) user.subscription = {};
            user.subscription.telegramInviteLink = inviteLink;
            user.subscription.telegramAccessStatus = 'granted';
            if (expiryDate) {
                user.subscription.telegramAccessExpiry = expiryDate;
            }
            user.markModified('subscription');
            await user.save();

        } else if (action === "remove") {
            // Kick User
            const { storedId, isNumeric } = getTelegramInfo();
            let targetId = storedId;

            // If not numeric, try to resolve it first if it looks like a username
            if (!isNumeric && storedId) {
                // Try to resolve
                const resolvedId = await TelegramBot.resolveTelegramId(storedId);
                if (resolvedId) {
                    targetId = resolvedId.toString();
                    // Update DB with resolved numeric ID to avoid future lookups
                    // We should probably update the 'id' in other_channels or add a new field.
                    // Updating other_channels 'id' might be risky if other things depend on it being the username.
                    // But 'id' usually implies unique identifier.
                    // Let's update it.
                    const channelIndex = user.other_channels?.findIndex((c: any) => c.channel === "telegramUsername" || c.channel === "telegram");
                    if (channelIndex !== -1) {
                        user.other_channels[channelIndex].id = targetId;
                        user.markModified('other_channels');
                        await user.save();
                    }
                } else {
                    return NextResponse.json({
                        success: false,
                        error: `Cannot kick user: Stored ID '${storedId}' is not numeric and could not be resolved. User must interact with the bot first.`
                    }, { status: 400 });
                }
            }

            if (!targetId) {
                return NextResponse.json({ success: false, error: "No Telegram User ID found." }, { status: 400 });
            }

            try {
                await TelegramBot.kickChatMember(TELEGRAM_GROUP_ID, targetId);
                await TelegramBot.unbanChatMember(TELEGRAM_GROUP_ID, targetId);

                result.message = "User kicked from Telegram group";

                if (user.subscription) {
                    user.subscription.telegramAccessStatus = 'revoked';
                    user.markModified('subscription');
                    await user.save();
                }
            } catch (err: any) {
                return NextResponse.json({ success: false, error: `Failed to kick user: ${err.message}` }, { status: 500 });
            }

        } else if (action === "check") {
            // Check membership
            const { storedId, isNumeric } = getTelegramInfo();
            let targetId = storedId;

            if (!isNumeric && storedId) {
                const resolvedId = await TelegramBot.resolveTelegramId(storedId);
                if (resolvedId) targetId = resolvedId.toString();
            }

            if (!targetId) {
                result.status = "unknown";
                result.message = "No numeric Telegram ID found";
            } else {
                try {
                    const member = await TelegramBot.getChatMember(TELEGRAM_GROUP_ID, targetId);
                    result.status = member?.status;
                    result.telegramUser = member?.user;

                    // Save resolved ID if we didn't have it before
                    if (member?.user?.id && (!isNumeric || targetId !== member.user.id.toString())) {
                        const channelIndex = user.other_channels?.findIndex((c: any) => c.channel === "telegramUsername" || c.channel === "telegram");
                        if (channelIndex !== -1) {
                            user.other_channels[channelIndex].id = member.user.id.toString();
                            user.markModified('other_channels');
                            await user.save();
                        }
                    }
                } catch (err: any) {
                    result.status = "error";
                    result.error = err.message;
                }
            }

            if (user.subscription) {
                result.inviteLink = user.subscription.telegramInviteLink;
                result.accessExpiry = user.subscription.telegramAccessExpiry;
            }
        } else if (action === "resolve") {
            // Explicit resolve action
            const { storedId } = getTelegramInfo();
            if (!storedId) {
                return NextResponse.json({ success: false, error: "No username/ID found to resolve" }, { status: 400 });
            }

            const resolvedId = await TelegramBot.resolveTelegramId(storedId);
            if (resolvedId) {
                const channelIndex = user.other_channels?.findIndex((c: any) => c.channel === "telegramUsername" || c.channel === "telegram");
                if (channelIndex !== -1) {
                    user.other_channels[channelIndex].id = resolvedId.toString();
                    user.markModified('other_channels');
                    await user.save();
                }
                result.message = "ID Resolved and Saved";
                result.resolvedId = resolvedId;
            } else {
                return NextResponse.json({ success: false, error: "Could not resolve ID. Ask user to message the bot." }, { status: 404 });
            }
        } else if (action === "update_status") {
            if (!status || !['granted', 'revoked'].includes(status)) {
                return NextResponse.json({ success: false, error: "Invalid status provided" }, { status: 400 });
            }

            if (!user.subscription) user.subscription = {};
            user.subscription.telegramAccessStatus = status;
            user.markModified('subscription');
            await user.save();

            result.message = `Telegram status updated to ${status}`;
            // Return the updated status so frontend can update UI
            result.status = status;


        }

        return NextResponse.json({
            success: true,
            ...result
        });

    } catch (error: any) {
        console.error("Telegram Sync Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
