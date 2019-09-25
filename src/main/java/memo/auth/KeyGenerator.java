package memo.auth;

import memo.util.Configuration;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;

public class KeyGenerator {

    private static String accessTokenKey = Configuration.get("JWT_ACCESS_TOKEN_KEY");
    private static String refreshTokenKey = Configuration.get("JWT_REFRESH_TOKEN_KEY");

    public static Key getRefreshKey() {
        return new SecretKeySpec(accessTokenKey.getBytes(), 0, accessTokenKey.getBytes().length, "DES");
    }

    public static Key getAccessKey() {
        return new SecretKeySpec(refreshTokenKey.getBytes(), 0, refreshTokenKey.getBytes().length, "DES");
    }
}
