import chalk from 'chalk';
import { createLogger, format, transports } from 'winston';
const { printf } = format;

const logFormat = printf((info) => {
    let level;
    switch (info.level) {
        case 'info':
            level = chalk.green(info.level);
            break;
        case 'warn':
            level = chalk.yellow(info.level);
            break;
        case 'debug':
            level = chalk.blue(info.level);
            break;
        case 'error':
            level = chalk.red(info.level);
            break;
        default:
            level = info.level; // eslint-disable-line
    }

    if (info.type === 'validation' && Array.isArray(info.errors)) {
        const errors = [];
        for (const e of info.errors) {
            let error = `${e.property}: ${e.value}\n`;
            if (e.constraints)  {
                for (const [type, message] of Object.entries(e.constraints)) {
                    error += `${message}\n`;
                    errors.push(error);
                }
            }
        }

        return `[${level}]: ${info.message} \n${errors.join('\n')}`;
    }

    return `[${level}]: ${info.message}`;
});

const logger = createLogger({
    level: process.env.DEBUG === 'data-fitration' ? 'debug' : 'info',
    format: logFormat,
    transports: [
        new transports.Console(),
    ],
});

export default logger;
