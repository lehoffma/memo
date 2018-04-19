package memo.auth;

import org.mindrot.jbcrypt.BCrypt;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class BCryptHelper {
    private static int workload = 12;
    private static Pattern bCryptPattern = Pattern.compile("^\\$2[ayb]\\$.{56}$");

    /**
     * Hashes the given password with the bcrypt algorithm
     *
     * @param password the plaintext password (e.g. when making a login or signup request)
     * @return a string of length 60 that is the bcrypt hash of the given password string
     */
    public static String hashPassword(String password) {
        String salt = BCrypt.gensalt(workload);
        return BCrypt.hashpw(password, salt);
    }

    /**
     *
     * @param value any string value
     * @return
     */
    public static boolean isBCryptHash(String value) {
        Matcher matcher = bCryptPattern.matcher(value);
        return matcher.find() && matcher.matches();
    }

    /**
     * @param password the plaintext password we want to check
     * @param hash     the hashed value we want to check against (stored in the db, for example)
     * @return true if the password matches the hash, false otherwise
     */
    public static boolean checkPasswords(String password, String hash) {
        return BCrypt.checkpw(password, hash);
    }
}
