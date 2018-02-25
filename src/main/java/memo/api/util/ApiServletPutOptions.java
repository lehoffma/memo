package memo.api.util;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Function;

public class ApiServletPutOptions<T, SerializedType> {
    private String objectName;
    private String jsonId;
    private Class<T> clazz;
    private BiConsumer<JsonNode, T> updateDependencies;
    private Function<T, SerializedType> getSerialized;
    private List<ModifyPrecondition<T>> preconditions;
    private String serializedKey;

    public ApiServletPutOptions() {
        this.jsonId = "id";
        this.updateDependencies = (jsonNode, t) -> {
        };
        this.serializedKey = "id";
    }

    public ApiServletPutOptions(String objectName, Class<T> clazz, Function<T, SerializedType> getSerialized) {
        this(objectName, clazz, getSerialized, "id", ((jsonNode, t) -> {
        }), "id");
    }

    public ApiServletPutOptions(String objectName, Class<T> clazz, Function<T, SerializedType> getSerialized, String jsonId) {
        this(objectName, clazz, getSerialized, jsonId, ((jsonNode, t) -> {
        }), "id");
    }

    public ApiServletPutOptions(String objectName, Class<T> clazz,
                                Function<T, SerializedType> getSerialized, String jsonId,
                                BiConsumer<JsonNode, T> updateDependencies) {
        this(objectName, clazz, getSerialized, jsonId, updateDependencies, "id");

    }

    public ApiServletPutOptions(String objectName, Class<T> clazz,
                                Function<T, SerializedType> getSerialized,
                                String jsonId,
                                BiConsumer<JsonNode, T> updateDependencies,
                                String serializedKey) {
        this.objectName = objectName;
        this.jsonId = jsonId;
        this.clazz = clazz;
        this.getSerialized = getSerialized;
        this.updateDependencies = updateDependencies;
        this.serializedKey = serializedKey;
        this.preconditions = new ArrayList<>();
    }

    public String getObjectName() {
        return objectName;
    }

    public ApiServletPutOptions<T, SerializedType> setObjectName(String objectName) {
        this.objectName = objectName;
        return this;
    }

    public String getJsonId() {
        return jsonId;
    }

    public ApiServletPutOptions<T, SerializedType> setJsonId(String jsonId) {
        this.jsonId = jsonId;
        return this;
    }

    public Class<T> getClazz() {
        return clazz;
    }

    public ApiServletPutOptions<T, SerializedType> setClazz(Class<T> clazz) {
        this.clazz = clazz;
        return this;
    }

    public BiConsumer<JsonNode, T> getUpdateDependencies() {
        return updateDependencies;
    }

    public ApiServletPutOptions<T, SerializedType> setUpdateDependencies(BiConsumer<JsonNode, T> updateDependencies) {
        this.updateDependencies = updateDependencies;
        return this;
    }

    public Function<T, SerializedType> getGetSerialized() {
        return getSerialized;
    }

    public ApiServletPutOptions<T, SerializedType> setGetSerialized(Function<T, SerializedType> getSerialized) {
        this.getSerialized = getSerialized;
        return this;
    }

    public String getSerializedKey() {
        return serializedKey;
    }

    public ApiServletPutOptions<T, SerializedType> setSerializedKey(String serializedKey) {
        this.serializedKey = serializedKey;
        return this;
    }

    public List<ModifyPrecondition<T>> getPreconditions() {
        return preconditions;
    }

    public ApiServletPutOptions<T, SerializedType> setPreconditions(List<ModifyPrecondition<T>> preconditions) {
        this.preconditions = preconditions;
        return this;
    }
}
