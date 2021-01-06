// Yoinked from zneix
// https://github.com/zneix/trihard-kkona
// Modified by slch000
const leadZero = function(n: number) {
    return n < 10 ? '0'+n : n.toString();
};
const dateFormat = function(date: Date) {
    return `${leadZero(date.getDate())}/${leadZero(date.getMonth()+1)}/${leadZero(date.getFullYear())}`;
};
const hourFormat = function (date: Date) {
    return `${leadZero(date.getHours())}:${leadZero(date.getMinutes())}:${leadZero(date.getSeconds())}`;
}
const logTime = (content: string) => {
	let dateNow = new Date();
	console.log(`${dateFormat(dateNow)} ${hourFormat(dateNow)} ${content}`);
}

export default {
    leadZero,
    dateFormat,
    hourFormat,
    logTime
};
