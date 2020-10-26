export const isABearerToken = (authorization: string) => {
    return authorization && authorization.split(' ')[0] === 'Bearer';
};

export const getTokenFromBearerAuthorization = (authorization: string) => {
    return authorization.split(' ')[1];
};
