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

    private static ApiUtils instance;

    private ApiUtils() {}

    public static ApiUtils getInstance()
    {
        if (instance == null) instance = new ApiUtils();
        return instance;
    }


    public void setContentType(HttpServletRequest request, HttpServletResponse response) {

        try {
            logger.trace("Set Character Encoding to UTF-8");

            request.setCharacterEncoding("UTF-8");
            response.setContentType("application/util;charset=UTF-8");

        } catch (UnsupportedEncodingException e) {
           logger.warn("Change of Character Encoding failed",e);
        }

    }

    public boolean isStringNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }

    public JsonNode getJsonObject(HttpServletRequest request, String objectName) {

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

    public <T> T updateFromJson(JsonNode jObject, T obj, Class<T> clazz) {


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

    public <T> void deleteFromDatabase(Class<T> clazz, HttpServletRequest request, HttpServletResponse response)
    {
        ApiUtils.getInstance().setContentType(request, response);
        String Sid = request.getParameter("id");
        logger.debug("Method DELETE called");

        T x = DatabaseManager.getInstance().getById(clazz, Sid);

        if (x == null) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }
        logger.debug("Object: " + x.toString() + " will be removed");
        DatabaseManager.getInstance().remove(x);
    }

    public void processNotFoundError(HttpServletResponse response) {
        try {
            response.setStatus(404);
            logger.trace("No object found");
            response.getWriter().append("not found");
            return;

        } catch (IOException e) {
            logger.warn("IO Error", e);
        }
    }

    public void processNotInvalidError(HttpServletResponse response) {
        try {
            response.setStatus(400);
            response.getWriter().append("invalid data");
            return;
        } catch (Exception e) {
            logger.warn("IO Error", e);
        }
    }

    public <T> void serializeObject(HttpServletResponse response, T obj, String objectName)
    {
        try {

            ObjectMapper mapper = new ObjectMapper();
            String output = mapper.writeValueAsString(obj);
            logger.trace("Serialization of object " + objectName + ": " + obj.toString());
            response.getWriter().append("{ \" " + objectName + "\": " + output + " }");

        } catch (Exception e) {
            logger.error("Unhandled Exception", e);
        }
    }
}
