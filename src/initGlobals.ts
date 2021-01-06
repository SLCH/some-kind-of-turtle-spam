import { ChatClient } from "dank-twitch-irc";

type MyGlobal = {
    chatClient: ChatClient;
    memeStuff?: {
        channel: string
    }
};

declare global {
    var my: MyGlobal;
}

export default function initGlobals(newGb: MyGlobal): void {
    globalThis.my = newGb;
}
