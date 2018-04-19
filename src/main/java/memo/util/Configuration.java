package memo.util;

import memo.model.Image;
import org.apache.log4j.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class Configuration {
    private static final Logger logger = Logger.getLogger(Image.class);
    private static final String path = "config.properties";

    private static Properties prop;

    public static String get(String key) {
        if (prop == null) {
            prop = readConfig();
        }
        return prop.getProperty(key);
    }

    private static Properties readConfig() {
        Properties prop = new Properties();
        try (InputStream resource = Configuration.class.getClassLoader().getResourceAsStream(path)) {
            prop.load(resource);
        } catch (IOException e) {
            logger.error("Could not read property file at '" + path + "'", e);
        } catch (NullPointerException e) {
            logger.error("Could not find property file at '" + path + "'", e);
        }
        //return an empty properties object if the file could not be found
        return prop;
    }
}
