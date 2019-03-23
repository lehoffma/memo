package memo.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.AbstractMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

@Named
@ApplicationScoped
public class JsonHelper {

    private static final Logger logger = LogManager.getLogger(JsonHelper.class);
    private static final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
            .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);

    public JsonHelper() {
    }

    public static boolean stringIsNotEmpty(String s) {
        return (s != null && !s.equals("null") && !s.isEmpty());
    }


    public static Optional<JsonNode> getJsonObject(HttpServletRequest request) {
        try {
            logger.trace("Parse Input Body");

            String body = org.apache.commons.io.IOUtils.toString(request.getReader());
            return getJsonObject(body);
        } catch (IOException e) {
            logger.error("Error while parsing Input to JSON", e);
        }
        return Optional.empty();
    }

    public static Optional<JsonNode> getJsonObject(String body) {
        try {
            JsonNode node = mapper.readTree(body);

            logger.debug("Input Body parsed.");
            return Optional.ofNullable(node);
        } catch (IOException e) {
            logger.error("Error while parsing Input to JSON", e);
        }
        return Optional.empty();
    }

    private static <T> JsonNode getJsonObject(Function<T, Optional<JsonNode>> getJson, T object, String objectName) {
        logger.trace("Parse Input Body and search for " + objectName);
        Optional<JsonNode> optionalJsonNode = getJson.apply(object)
                .map(jsonNode -> jsonNode.get(objectName));

        if (optionalJsonNode.isPresent()) {
            logger.debug("Input Body parsed. " + objectName + " found!");
        }

        return optionalJsonNode.orElse(null);
    }

    public static JsonNode getJsonObject(String body, String objectName) {
        return getJsonObject(JsonHelper::getJsonObject, body, objectName);
    }

    public static JsonNode getJsonObject(HttpServletRequest request, String objectName) {
        return getJsonObject(JsonHelper::getJsonObject, request, objectName);
    }

    public static <T> T updateFromJson(JsonNode jObject, T obj, Class<T> clazz) {
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


    public static <T> JsonNode toJsonNode(T obj) {
        return mapper.valueToTree(obj);
    }

    public static <T> ObjectNode toObjectNode(T obj, String objectName) {
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


    public static ObjectNode toObjectNode(Map<String, Object> objectMap) {
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

    public static String toString(Map<String, Object> objectMap) {
        return toObjectNode(objectMap).toString();
    }
}
