class Utilsfucntions {
    static bardisplay(percent) {
        if (percent <= 20) {
            const bar =
                "<:barmidempty:975528569881104385><:barmidempty:975528569881104385><:barmidempty:975528569881104385><:barendempty:975529693640028211>";
            const leftperc = 20 - percent;
            if (leftperc > 15) {
                return "<:barstartempty:975528227214876713>" + bar;
            } else if (leftperc > 10) {
                return "<:barstartlow:975528109900197990>" + bar;
            } else if (leftperc > 5) {
                return "<:barstartmid:975527911522181150>" + bar;
            } else if (leftperc > 0) {
                return "<:barstarthigh:975527916836360294>" + bar;
            } else if (leftperc === 0) {
                return "<:barstartfull:975526638831955968>" + bar;
            }
        } else if (percent <= 40) {
            const bars = "<:barstartfull:975526638831955968>";
            const bare =
                "<:barmidempty:975528569881104385><:barmidempty:975528569881104385><:barendempty:975529693640028211>";
            const leftperc = 40 - percent;
            if (leftperc > 15) {
                return bars + "<:barmidempty:975528569881104385>" + bare;
            } else if (leftperc > 10) {
                return bars + "<:barmidlow:975527412676849674>" + bare;
            } else if (leftperc > 5) {
                return bars + "<:barmidmid:975527288768696400>" + bare;
            } else if (leftperc > 0) {
                return bars + "<:barmidhigh:975526979598180412>" + bare;
            } else if (leftperc === 0) {
                return bars + "<:barmidfull:975526638697734237>" + bare;
            }
        } else if (percent <= 60) {
            const bars =
                "<:barstartfull:975526638831955968><:barmidfull:975526638697734237>";
            const bare =
                "<:barmidempty:975528569881104385><:barendempty:975529693640028211>";
            const leftperc = 60 - percent;
            if (leftperc > 15) {
                return bars + "<:barmidempty:975528569881104385>" + bare;
            } else if (leftperc > 10) {
                return bars + "<:barmidlow:975527412676849674>" + bare;
            } else if (leftperc > 5) {
                return bars + "<:barmidmid:975527288768696400>" + bare;
            } else if (leftperc > 0) {
                return bars + "<:barmidhigh:975526979598180412>" + bare;
            } else if (leftperc === 0) {
                return bars + "<:barmidfull:975526638697734237>" + bare;
            }
        } else if (percent <= 80) {
            const bars =
                "<:barstartfull:975526638831955968><:barmidfull:975526638697734237><:barmidfull:975526638697734237>";
            const bare = "<:barendempty:975529693640028211>";
            const leftperc = 80 - percent;
            if (leftperc > 15) {
                return bars + "<:barmidempty:975528569881104385>" + bare;
            } else if (leftperc > 10) {
                return bars + "<:barmidlow:975527412676849674>" + bare;
            } else if (leftperc > 5) {
                return bars + "<:barmidmid:975527288768696400>" + bare;
            } else if (leftperc > 0) {
                return bars + "<:barmidhigh:975526979598180412>" + bare;
            } else if (leftperc === 0) {
                return bars + "<:barmidfull:975526638697734237>" + bare;
            }
        } else if (percent <= 100) {
            const bar =
                "<:barstartfull:975526638831955968><:barmidfull:975526638697734237><:barmidfull:975526638697734237><:barmidfull:975526638697734237>";
            const leftperc = 100 - percent;
            if (leftperc > 15) {
                return bar + "<:barendempty:975529693640028211>";
            } else if (leftperc > 10) {
                return bar + "<:barendlow:975533190930391060>";
            } else if (leftperc > 5) {
                return bar + "<:barendmid:975533190934585374>";
            } else if (leftperc > 0) {
                return bar + "<:barendhigh:975533190980730901>";
            } else if (leftperc === 0) {
                return bar + "<:barendfull:975526638857097337>";
            }
        }
    }
}

module.exports = Utilsfucntions;
