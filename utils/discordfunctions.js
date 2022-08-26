const { fetchSettingsData } = require("./currencyfunctions");

class Discordfunctions {
    static async dmuser(client, userId, embed, content) {
        const fetch_settingsData = await fetchSettingsData(userId);
        const settingsData = fetch_settingsData.data;
        const message = {};

        if (!content && !embed) return;
        if (settingsData.settings.dmnotifications.status === false) {
            return;
        }
        if (embed) {
            message.embeds = [embed];
        }
        if (content) {
            message.content = content;
        }
        await client.users.fetch(userId, false).then((user) => {
            user.send(message);
        });
        return true;
    }
}

module.exports = Discordfunctions;
