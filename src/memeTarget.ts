import { ChatClient } from "dank-twitch-irc";
import got from "got/dist/source";
import * as logging from "./utils/logging";

export class MemeTarget {
    private channel: string;
    private client: ChatClient;
    private ready: Promise<void>;
    private queue: (() => Promise<void>)[];

    constructor(channel: string, client: ChatClient) {
        this.channel = channel;
        this.client = client;


        if (!client.joinedChannels.has(channel)) {
            this.ready = client.join(channel);
        } else {
            this.ready = Promise.resolve();
        }
        this.queue = [];
    }

    async destroy(): Promise<void> {
        return this.client.part(this.channel);
    }

    async executeAs(asA: 'pleb' | 'mod'): Promise<void> {
        if (asA === 'pleb') {
            return this.execute({
                delayMs: 1000,
            });
        } else {
            return this.execute({
                delayMs: 100,
            });
        }
    }

    async execute(opt?: { delayMs: number }): Promise<void> {
        if (!opt) {
            opt = {
                delayMs: 300,
            }
        }
        try {
            for (const cmd of this.queue) {
                cmd();
                if (opt.delayMs) {
                    await this.delay(opt.delayMs);
                }
            }
        } catch(err) {
            logging.logError(err);
        }
    }
    
    async sayHi(times: number = 5) {
        await this.ready;
    
        const asIWasSaying: Promise<void>[] = [];
        for(let i = 0; i < times; i++) {
            this.queue.push(() => this.client.say(this.channel, i.toString()));
        }
        return;
    }

    async turtlerush(msg: string, roles: 'everyone' | string[]): Promise<void> {
        await this.ready;
        
        let peopleToPing = roles as string[];
        if (roles === 'everyone') {
            const doNotPingMonkas = new Set([
                'pajlada',
                'leppunen',
                'test',
                'streamelements',
                'icecreamdatabase',

            ]);
            peopleToPing = await this.getChatters(this.channel, [ 'broadcaster', 'moderators', 'vips' ]);
            peopleToPing = peopleToPing.filter(p => !doNotPingMonkas.has(p));
        }

        const colorGenerator = this.getRandomTwitchColor();

        for (const person of peopleToPing) {
            this.queue.push(() => {
                this.client.sendRaw(`PRIVMSG #${this.channel} :/color ${colorGenerator()}`);
                return this.client.me(this.channel, `${msg} ${person}`)
            });
        }
        return;
    }

    pyramid(msg: string, width: number = 3) {
        let i = 1;
        let curMsg = '';
        while(i <= width) {
            curMsg += ' ' + msg;
            i++;
            this.addToQueue(curMsg);
        }
        while(--i) {
            curMsg = curMsg.slice(0, curMsg.length - msg.length - 1);
            this.addToQueue(curMsg);
        }
    }

    private addToQueue(msg: string): void {
        this.queue.push(() => this.client.say(this.channel, msg));
    }

    private async getChatters(
        channel: string,
        passedRoles: ('broadcaster' | 'vips' | 'moderators' | 'viewers')[] | 'everyone' = 'everyone'
            ): Promise<string[]> {

        const json = await got(`https://tmi.twitch.tv/group/user/${channel}/chatters`).json();
        const c = (json as any).chatters;

        if (passedRoles === 'everyone') {
            return [
                ...c.broadcaster,
                ...c.vips,
                ...c.moderators,
                ...c.viewers,
            ];
        }

        let people: string[] = [];
        passedRoles.forEach(r => {
            people = [
                ...people,
                ...c[r]
            ]
        })
        return people;
    }

    private getRandomTwitchColor() {
        const colors = [
            'Blue',
            'BlueViolet',
            'CadetBlue',
            'Chocolate',
            'Coral',
            'DodgerBlue',
            'Firebrick',
            'GoldenRod',
            'Green',
            'HotPink',
            'OrangeRed',
            'Red',
            'SeaGreen',
            'SpringGreen',
            'YellowGreen',
        ];
        return function() {
            const rnd = Math.round(Math.random() * (colors.length - 1));
            return colors[rnd];
        }
    }

    private delay = (t: number) => new Promise(resolve => setTimeout(resolve, t));
}