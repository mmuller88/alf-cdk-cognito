export function isValidBase64String(s: string, urlOnly: boolean) {
    try {
        const validChars = urlOnly ?
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=' :
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_+/=';

        let hasPadding = false;
        for(let i = 0; i < s.length; ++i) {
            // @ts-ignore
            hasPadding |= s.charAt(i) === '=';
            if(validChars.indexOf(s.charAt(i)) === -1) {
                return false;
            }
        }

        if(hasPadding) {
            for(let i = s.indexOf('='); i < s.length; ++i) {
                if(s.charAt(i) !== '=') {
                    return false;
                }
            }

            return s.length % 4 === 0;
        }

        return true;
    } catch (e) {
        return false;
    }
}
