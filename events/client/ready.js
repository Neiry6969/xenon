module.exports = (Discord, client) => {
    console.log(`Logged in as ${client.user.tag}...`)

    client.user.setPresence({
        activities: [{ name: `Currently in ${client.guilds.cache.size} servers`, type: 'WATCHING' }],
      })
}