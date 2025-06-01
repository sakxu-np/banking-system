import * as jsonwebtoken from 'jsonwebtoken';

// Add a more permissive type definition for the sign function to work with string secrets
declare module 'jsonwebtoken' {
    export function sign(
        payload: string | Buffer | object,
        secretOrPrivateKey: string,
        options?: jsonwebtoken.SignOptions
    ): string;
}
