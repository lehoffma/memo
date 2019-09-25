package memo.util;

import memo.model.Image;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;
import java.util.Properties;

public class Configuration {
    private static final Logger logger = LogManager.getLogger(Image.class);
    private static final String path = "config.properties";

    private static Properties prop;
    private static Boolean noPropertiesFile = null;

    public static String get(String key) {
        if (prop == null && noPropertiesFile == null) {
            prop = readConfig();
        }
        return Optional.ofNullable(prop)
                .map(it -> it.getProperty(key))
                .orElseGet(() -> System.getenv(key));
    }

    private static Properties readConfig() {
        Properties prop = new Properties();
        try (InputStream resource = Configuration.class.getClassLoader().getResourceAsStream(path)) {
            prop.load(resource);
            noPropertiesFile = false;
        } catch (IOException e) {
            logger.error("Could not read property file at '" + path + "'", e);
            noPropertiesFile = true;
        } catch (NullPointerException e) {
            logger.error("Could not find property file at '" + path + "'", e);
            noPropertiesFile = true;
        }
        //return an empty properties object if the file could not be found
        return prop;
    }
}
