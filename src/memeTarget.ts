import { ChatClient } from "dank-twitch-irc";
import got from "got/dist/source";

export class MemeTarget {
    private channel: string;
    private client: ChatClient;
    private ready: Promise<void>;

    constructor(channel: string, client: ChatClient) {
        this.channel = channel;
        this.client = client;


        if (!client.joinedChannels.has(channel)) {
            this.ready = client.join(channel);
        }
        this.ready = Promise.resolve();
    }

    async destroy(): Promise<void> {
        return this.client.part(this.channel);
    }
    
    async sayHi(times: number = 5) {
        await this.ready;
    
        const asIWasSaying: Promise<void>[] = [];
        for(let i = 0; i < times; i++) {
            asIWasSaying.push(this.client.say(this.channel, i.toString()));
        }
        return Promise.all(asIWasSaying);
    }

    async turtlerush(who: 'everyone' | string[]): Promise<void[]> {
        await this.ready;
        
        let peopleToPing = who as string[];
        if (who === 'everyone') {
            const doNotPingMonkas = new Set([
                'pajlada',
            ]);
            peopleToPing = await this.getChatters(this.channel);
            peopleToPing.filter(p => !doNotPingMonkas.has(p));
        }

        const colorGenerator = this.getRandomTwitchColor();

        // should probably forof this
        const toSend: (() => Promise<void>)[] = [];
        for (const person of peopleToPing) {
            toSend.push(() => {
                this.client.sendRaw(`PRIVMSG #${this.channel} :/color ${colorGenerator()}`);
                return this.client.me(this.channel, `DankStick ${person}`)
            });
        }
        return Promise.all(toSend.map(f => f()));
    }

    private async getChatters(channel: string): Promise<string[]> {
        const json = await got(`https://tmi.twitch.tv/group/user/${channel}/chatters`).json();
        const c = (json as any).chatters;

        const people = [
            ...c.broadcaster,
            ...c.vips,
            ...c.moderators,
            // ...c.viewers,
        ];
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
}