package memo.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.io.CharStreams;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

public class ApiUtils {

    static final Logger logger = Logger.getLogger(ApiUtils.class);

    public static void setContentType(HttpServletRequest request, HttpServletResponse response) {

        try {
            logger.trace("Set Character Encoding to UTF-8");

            request.setCharacterEncoding("UTF-8");
            response.setContentType("application/util;charset=UTF-8");

        } catch (UnsupportedEncodingException e) {
           logger.warn("Change of Character Encoding failed",e);
        }

    }

    public static boolean isStringNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }

    public static JsonNode getJsonObject(HttpServletRequest request, String objectName) {

        try {
            logger.trace("Parse Input Body and search for " + objectName);

            String body = CharStreams.toString(request.getReader());

            ObjectMapper mapper = new ObjectMapper();
            JsonNode n = mapper.readTree(body).get(objectName);

            logger.debug("Input Body parsed. " + objectName + " found!");

            return n;

        } catch (IOException e) {

            logger.error("Error while parsing Input to JSON", e);
        }
        return null;
    }

    public static <T> T updateFromJson(JsonNode jObject, T obj, Class<T> clazz) {


        try {

            logger.trace("Deserialize object of type " + clazz.getName() + "into existing object " + obj.toString());

            ObjectMapper mapper = new ObjectMapper();
            obj = mapper.readerForUpdating(obj).treeToValue(jObject, clazz);

            logger.debug("Processed Object of class " + clazz.getName());

            return obj;

        } catch (JsonProcessingException e) {

            logger.error("Error while parsing JSON to Java Object", e);
        }
        return null;
    }
}
