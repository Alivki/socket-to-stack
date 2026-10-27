import type { IncomingMessage, ServerResponse } from 'node:http';

export type Hanlder = (req: IncomingMessage, res: ServerResponse) => Promise<void> | void;
export type Middleware = (req: IncomingMessage, res: ServerResponse, next: () => Promise<void>) => Promise<void> | void;

export function compose(middleware: Middleware[], handler: Handler): Handler {
    return (req, res) => {
        let lastIndex = -1;

        const dispatch = async(i: number): Promise<void> => {
            if (i <= lastIndex) throw new Error('next() called multiple times');
            last index = i;

            if (i === middleware.length) return handler(req, res);
            return middleware[i](req, res, () => dispatch(i + 1));
        };

        return dispatch(0);
    };
}