import { fetchEventSource } from "@microsoft/fetch-event-source";
import {BASE_URL} from "@/http/config.ts";
class FatalError extends Error {}
class RetriableError extends Error {}

type ResultCallBack = (e: any | null) => void;

const BaseUrl = BASE_URL;
export const postStreamChat = (
    author: string,
    onMessage: ResultCallBack,
    onError: ResultCallBack,
    onClose: ResultCallBack
) => {
    const ctrl = new AbortController();
    fetchEventSource(BaseUrl + "/post-chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            author: author,
        }),
        signal: ctrl.signal,
        onmessage: onMessage,
        onerror: (err: any) => {
            onError(err);
        },
        onclose: () => {
            onClose(null);
        },
        onopen: async (response: any) => {
            if (response.ok) {
                return;
            } else if (
                response.status >= 400 &&
                response.status < 500 &&
                response.status !== 429
            ) {
                throw new FatalError();
            } else {
                throw new RetriableError();
            }
        },
    });
};

export const getStreamChat = (
    message: string,
    onMessage: ResultCallBack,
    onError: ResultCallBack,
    onClose: ResultCallBack
) => {
    const ctrl = new AbortController();
    fetchEventSource(BaseUrl + "/chat/stream?message=" + message, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: null,
        signal: ctrl.signal,
        onmessage: onMessage,
        onerror: (err: any) => {
            onError(err);
        },
        onclose: () => {
            onClose(null);
        },
        onopen: async (response: any) => {
            if (response.ok) {
                return;
            } else if (
                response.status >= 400 &&
                response.status < 500 &&
                response.status !== 429
            ) {
                throw new FatalError();
            } else {
                throw new RetriableError();
            }
        },
    });
};