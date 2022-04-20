const calc = [
    {
        place: 'studio',
        coins: Math.floor(Math.random() * 100032) + 1000,
    },
    {
        place: 'beach',
        coins: Math.floor(Math.random() * 10000) + 1000,
    },
    {
        place: 'valley',
        coins: Math.floor(Math.random() * 1500) + 1000,
    },
    {
        place: 'school',
        coins: Math.floor(Math.random() * 1000) + 500,
    },
]

module.exports = [
    {
        place: 'studio',
        message: `You found ❀ \`${calc.find((val) => (val.place.toLowerCase()) === 'studio').coins.toLocaleString()}\``,
        coins: calc.find((val) => (val.place.toLowerCase()) === 'studio').coins,
    },
    {
        place: 'beach',
        message: `You searched the sandy beaches and found ❀ \`${calc.find((val) => (val.place.toLowerCase()) === 'beach').coins.toLocaleString()}\`, what a find!`,
        coins: calc.find((val) => (val.place.toLowerCase()) === 'beach').coins,
    },
    {
        place: 'valley',
        message: `The valley had ❀ \`${calc.find((val) => (val.place.toLowerCase()) === 'valley').coins.toLocaleString()}\` and you just picked it up.`,
        coins: calc.find((val) => (val.place.toLowerCase()) === 'valley').coins,
        items: 'painting',
        itempecrent: 100,
    },
    {
        place: 'school',
        message: `You went to school and found ❀ \`${calc.find((val) => (val.place.toLowerCase()) === 'school').coins.toLocaleString()}\``,
        coins: calc.find((val) => (val.place.toLowerCase()) === 'school').coins,
    },
]