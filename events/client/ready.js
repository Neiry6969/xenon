module.exports = (Discord, client) => {
    console.log(`Logged in as ${client.user.tag}...`)

    client.user.setPresence({
        activities: [{ name: `With you.`, type: 'PLAYING' }],
      })
}