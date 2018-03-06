package memo.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.google.common.io.CharStreams;
import memo.auth.api.ShopItemAuthHelper;
import org.apache.log4j.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.AbstractMap;
import java.util.Map;
import java.util.Optional;

public class ApiUtils {

    static final Logger logger = Logger.getLogger(ApiUtils.class);
    public static final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

    private static ApiUtils instance;

    private ApiUtils() {
    }

    public static ApiUtils getInstance() {
        if (instance == null) instance = new ApiUtils();
        return instance;
    }


    public void setContentType(HttpServletRequest request, HttpServletResponse response) {

        try {
            logger.trace("Set Character Encoding to UTF-8");

            request.setCharacterEncoding("UTF-8");
            response.setContentType("application/util;charset=UTF-8");

        } catch (UnsupportedEncodingException e) {
            logger.warn("Change of Character Encoding failed", e);
        }

    }

    public static boolean stringIsNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }


    public Optional<JsonNode> getJsonObject(HttpServletRequest request) {
        try {
            logger.trace("Parse Input Body");

            String body = CharStreams.toString(request.getReader());

            JsonNode node = mapper.readTree(body);

            logger.debug("Input Body parsed.");

            return Optional.ofNullable(node);
        } catch (IOException e) {
            logger.error("Error while parsing Input to JSON", e);
        }
        return Optional.empty();
    }


    public JsonNode getJsonObject(HttpServletRequest request, String objectName) {
        logger.trace("Parse Input Body and search for " + objectName);
        Optional<JsonNode> optionalJsonNode = this.getJsonObject(request)
                .map(jsonNode -> jsonNode.get(objectName));

        if (optionalJsonNode.isPresent()) {
            logger.debug("Input Body parsed. " + objectName + " found!");
        }
        //todo move to optional instead
        return optionalJsonNode.orElse(null);
    }

    public <T> T updateFromJson(JsonNode jObject, T obj, Class<T> clazz) {
        try {
            logger.trace("Deserialize object of type " + clazz.getName() + "into existing object " + obj.toString());

            obj = mapper.readerForUpdating(obj).treeToValue(jObject, clazz);

            logger.debug("Processed Object of class " + clazz.getName());

            return obj;

        } catch (JsonProcessingException e) {

            logger.error("Error while parsing JSON to Java Object", e);
        }
        return null;
    }

    public void processNotFoundError(HttpServletResponse response) {
        try {
            response.setStatus(404);
            logger.trace("No object found");
            response.getWriter().append("not found");
        } catch (IOException e) {
            logger.warn("IO Error", e);
        }
    }



    public void processInvalidError(HttpServletResponse response) {
        try {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().append("invalid data");
        } catch (Exception e) {
            logger.warn("IO Error", e);
        }
    }

    public <T> JsonNode toJsonNode(T obj) {
        return mapper.valueToTree(obj);
    }

    public <T> ObjectNode toObjectNode(T obj, String objectName) {
        ObjectNode objectNode = JsonNodeFactory.instance.objectNode();
        JsonNode valueNode;
        if (obj instanceof JsonNode) {
            valueNode = (JsonNode) obj;
        } else {
            valueNode = mapper.valueToTree(obj);
        }
        objectNode.set(objectName, valueNode);
        return objectNode;
    }


    public ObjectNode toObjectNode(Map<String, Object> objectMap) {
        ObjectNode objectNode = JsonNodeFactory.instance.objectNode();

        objectMap.entrySet().stream()
                .map(entry -> {
                    JsonNode valueNode;
                    if (entry.getValue() instanceof JsonNode) {
                        valueNode = (JsonNode) entry.getValue();
                    } else {
                        valueNode = mapper.valueToTree(entry.getValue());
                    }
                    return new AbstractMap.SimpleEntry<>(
                            entry.getKey(),
                            valueNode
                    );
                })
                .forEach(entry -> objectNode.set(entry.getKey(), entry.getValue()));

        return objectNode;
    }

    public <T> void serializeObject(HttpServletResponse response, T obj, String objectName) {
        try {
            ObjectNode objectNode = this.toObjectNode(obj, objectName);
            logger.trace("Serialization of object " + objectName + ": " + obj.toString());
            response.getWriter().append(objectNode.toString());
        } catch (Exception e) {
            logger.error("Unhandled Exception", e);
        }
    }
}
