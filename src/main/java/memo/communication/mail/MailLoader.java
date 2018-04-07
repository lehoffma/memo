package memo.communication.mail;

import memo.communication.MessageType;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public class MailLoader {
    private static final Logger logger = Logger.getLogger(MailLoader.class);

    public static String loadAsText(MessageType type) {
        String path = "mail/" + type.getName() + ".html";
        try (InputStream resource = MailLoader.class.getClassLoader().getResourceAsStream(path)) {
            return IOUtils.toString(resource, StandardCharsets.UTF_8);
        } catch (IOException e) {
            logger.error("Could not read email template of type " + type.getName(), e);
            return null;
        }
    }

    public static String replacePlaceholders(String inputText, Map<String, String> replacements) {
        String replacedText = inputText;
        for (Map.Entry<String, String> entry : replacements.entrySet()) {
            replacedText = replacedText.replace(entry.getKey(), entry.getValue());
        }
        return replacedText;
    }
}
