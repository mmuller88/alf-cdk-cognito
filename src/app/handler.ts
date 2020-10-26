// import {verifyBearerToken} from "./helper/bearer-token-verification.helper";
// import {getTokenFromBearerAuthorization, isABearerToken} from "./helper/authorization.helper";
// import {isBearerTokenExpired} from "./helper/bearer-token-expiration.helper";
// import {
//     onAuthorizationError,
//     onAuthorizationExpiredError, onAuthorizationSuccess,
//     onInvalidAuthentication
// } from "./helper/authorization-message.helper";
import { generatePolicy } from "./helper/policy.helper";

// require('dotenv').config();
// const secret = process.env.JWT_SECRET || '';
// const log = require('loglevel');
// log.setLevel("trace");
import AWS = require('aws-sdk');
AWS.config.logger = console;

export const handler = async (event: any, context: any): Promise<any> => {

    console.debug('event: ' + JSON.stringify(event));
    console.debug('context: ' + JSON.stringify(context));
        // const authorization = event.authorizationToken;
    // if (!isABearerToken(authorization)) {
    //     return onInvalidAuthentication(context);
    // }

    // const bearerToken = getTokenFromBearerAuthorization(authorization);
    // const bearerTokenIsValid = await Promise.resolve(verifyBearerToken(bearerToken, secret));
    // if (!bearerTokenIsValid) {
    //     return onAuthorizationError(context);
    // }

    // const bearerTokenIsExpired = isBearerTokenExpired(bearerToken);
    // if (bearerTokenIsExpired) {
    //     return onAuthorizationExpiredError(context);
    // }
    const userName = event.userName;
    // return {status: 'ok'};
    return {status:'ok',context:context.succeed(generatePolicy(userName, 'Allow', event.methodArn))};
};
