import chalk from "chalk";
import { ChatClient } from "dank-twitch-irc";

import config from './config.json';
import * as utils from "./src/utils/logging";
import initGlobals from './src/initGlobals';
import { MemeTarget } from "./src/memeTarget";

type UserConfig = {
    username: string;
    token: string;
    selected?: boolean;
}

type UserConfigMap = {
    [username: string]: UserConfig
};

const configUsers: UserConfigMap = {};
config.users.forEach(u => configUsers[u.username] = u);

const me = config.users.filter(u => u.selected)[0];

if (!me) {
    utils.logTime(`${chalk.red('[ERROR]')} No user chosen for run!`);
    process.exit(1);
}

const client = new ChatClient({
    username: me.username,
    password: `oauth:${me.token}`,
    connectionRateLimits: {
        parallelConnections: 5,
        releaseTime: 0,
    }
});
initGlobals({
    chatClient: client,
    memeStuff: config.memeStuff
});

client.on('JOIN', context => {
	utils.logTime(`${chalk.blueBright('[JOIN]')} ${chalk.whiteBright(context.channelName)}`);
});

client.on('PART', context => {
	utils.logTime(`${chalk.blue('[PART]')} ${chalk.white(context.channelName)}`);
});

client.on('close', err => {
    if (err) {
        utils.logTime(`${chalk.red('[CLOSED WITH ERROR]')} || Closed chat client`);
    } else {
        utils.logTime(`${chalk.blue('[CLOSED]')} || Closed chat client`);
    }
})

client.on('ready', async () => {
    utils.logTime(`${chalk.green('[CONNECTED]')} || Connected to twitch.`);
    
    doTheThing();
});

async function doTheThing() {
    if (!globalThis.my.memeStuff) {
        return;
    }
    const memes = new MemeTarget(globalThis.my.memeStuff.channel, client);
    memes.pyramid('dankCrayon', 5);
    await memes.executeAs('mod');
    await memes.destroy();
    client.close();
    process.exit(0);
}

client.connect();
