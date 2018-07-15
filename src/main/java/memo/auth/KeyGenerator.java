package memo.auth;

import javax.crypto.spec.SecretKeySpec;
import java.security.Key;

public class KeyGenerator {

    //todo
    public static Key getRefreshKey() {
        String keyString = "lefunirefreshkey";
        return new SecretKeySpec(keyString.getBytes(), 0, keyString.getBytes().length, "DES");
    }

    public static Key getAccessKey() {
        String keyString = "lefuniaccesskey";
        return new SecretKeySpec(keyString.getBytes(), 0, keyString.getBytes().length, "DES");
    }
}
