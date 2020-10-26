export const timestampIsInThePast = (timestampInSeconds:number) => {
    let currentTimestampInSeconds = Date.now()/1000;
    return timestampInSeconds <= currentTimestampInSeconds;
}
