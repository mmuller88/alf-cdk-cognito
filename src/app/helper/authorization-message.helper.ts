import {decodeBearerToken} from "./bearer-token-decoding.helper";
import {generatePolicy} from "./policy.helper";

export const onAuthorizationSuccess = (bearerToken: string, context: any, methodArn: any) => {
    const decodedBearerToken = decodeBearerToken(bearerToken);
    // @ts-ignore
    return context.succeed(generatePolicy(decodedBearerToken.payload.sub, 'Allow', methodArn));
};

export const onAuthorizationExpiredError = (_context: any) => {
    console.log('token expired, not authorized');
    throw Error("Unauthorized");
};

export const onAuthorizationError = (_context: any) => {
    console.log('invalid token, not authorized');
    throw Error("Unauthorized");
};

export const onInvalidAuthentication = (_context: any) => {
    console.log('invalid authorization token or header');
    throw Error("Unauthorized");
};
