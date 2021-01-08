// Yoinked from zneix
// https://github.com/zneix/trihard-kkona
// Modified by slch000

import chalk from "chalk";

export const leadZero = function(n: number) {
    return n < 10 ? '0'+n : n.toString();
};
export const dateFormat = function(date: Date) {
    return `${leadZero(date.getDate())}/${leadZero(date.getMonth()+1)}/${leadZero(date.getFullYear())}`;
};
export const hourFormat = function (date: Date) {
    return `${leadZero(date.getHours())}:${leadZero(date.getMinutes())}:${leadZero(date.getSeconds())}`;
}
export const logTime = (content: string) => {
	let dateNow = new Date();
	console.log(`${dateFormat(dateNow)} ${hourFormat(dateNow)} ${content}`);
}

export const logError = (err: Error) => {
    logTime(`${chalk.red('[ERROR]')} || ${err.message}`);
    console.error(err);
}
