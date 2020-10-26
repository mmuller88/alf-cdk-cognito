const b64u= require('base64url');
export function decodeBearerToken(jwt: string) {
    const result:any = {
        header: {},
        payload: {},
        errors: false
    };

    if(!jwt) {
        result.errors = true;
        return result;
    }

    const split = jwt.split('.');

    try {
        result.header = JSON.parse(b64u.decode(split[0]));
    } catch(e) {
        result.header = {};
        result.errors = true;
    }

    try {
        result.payload = JSON.parse(b64u.decode(split[1]));
    } catch(e) {
        result.payload = {};
        result.errors = true;
    }

    return result;
}
