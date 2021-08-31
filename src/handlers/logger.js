const chalk = require("chalk");

const logger = (mode) => {
    return (...args) => {
        let output = args.join(" "),
            timeFormatted = new Date().toLocaleTimeString("ru-RU", { hour12: false });

        switch (mode) {
            case 0:
                console.log(chalk.whiteBright(`[${timeFormatted} - INFO] ` + output));
                break;
            case 1:
                console.log(chalk.yellowBright(`[${timeFormatted} - WARN] ` + output));
                break;
            case 2:
                console.log(chalk.redBright(`[${timeFormatted} - ERROR] ` + output));
                break;
        };
    };
};

module.exports = {
    log: logger(0),
    warn: logger(1),
    error: logger(2)
};