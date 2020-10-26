export const generatePolicy = function (principalId: string, effect: string, resource: string) {
    var authResponse = {};
    // @ts-ignore
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        // @ts-ignore
        policyDocument.Version = '2012-10-17'; // default version
        // @ts-ignore
        policyDocument.Statement = [];
        var statementOne = {};
        // @ts-ignore
        statementOne.Action = 'execute-api:Invoke'; // default action
        // @ts-ignore
        statementOne.Effect = effect;
        // @ts-ignore
        statementOne.Resource = "*"; // resource;
        // @ts-ignore
        policyDocument.Statement[0] = statementOne;
        // @ts-ignore
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
};
