import {decodeBearerToken} from "./bearer-token-decoding.helper";
import {timestampIsInThePast} from "./timestamp.helper";

export const isBearerTokenExpired = (bearerToken:string) => {
      const expirationDate = decodeBearerToken(bearerToken)?.payload?.exp;
      return timestampIsInThePast(expirationDate);
}
