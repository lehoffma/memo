package memo.auth;

import memo.util.Configuration;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;

public class KeyGenerator {

    private static String accessTokenKey = Configuration.get("jwt.access_token_key");
    private static String refreshTokenKey = Configuration.get("jwt.refresh_token_key");

    public static Key getRefreshKey() {
        return new SecretKeySpec(accessTokenKey.getBytes(), 0, accessTokenKey.getBytes().length, "DES");
    }

    public static Key getAccessKey() {
        return new SecretKeySpec(refreshTokenKey.getBytes(), 0, refreshTokenKey.getBytes().length, "DES");
    }
}
