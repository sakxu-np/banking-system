declare module 'jsonwebtoken' {
    import * as jwt from 'jsonwebtoken';

    export interface SignOptions {
        expiresIn?: string | number;
        notBefore?: string | number;
        audience?: string | string[];
        algorithm?: string;
        header?: object;
        issuer?: string;
        jwtid?: string;
        keyid?: string;
        mutatePayload?: boolean;
        noTimestamp?: boolean;
        subject?: string;
        encoding?: string;
    }

    export function sign(
        payload: string | Buffer | object,
        secretOrPrivateKey: string | Buffer,
        options?: SignOptions
    ): string;
}
