package memo.api.util;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Function;

public class ApiServletPostOptions<T, SerializedType> {
    private String objectName;
    private T baseValue;
    private Class<T> clazz;
    private BiConsumer<JsonNode, T> updateDependencies;
    private Function<T, SerializedType> getSerialized;
    private List<ModifyPrecondition<T>> preconditions;
    private String serializedKey;

    public ApiServletPostOptions() {
        this.updateDependencies = (jsonNode, t) -> {
        };
        this.serializedKey = "id";
    }

    public ApiServletPostOptions(String objectName, T baseValue, Class<T> clazz, Function<T, SerializedType> getSerialized) {
        this(objectName, baseValue, clazz, getSerialized, ((jsonNode, t) -> {
        }), "id");
    }

    public ApiServletPostOptions(String objectName, T baseValue, Class<T> clazz,
                                 Function<T, SerializedType> getSerialized, BiConsumer<JsonNode, T> updateDependencies) {
        this(objectName, baseValue, clazz, getSerialized, updateDependencies, "id");

    }

    public ApiServletPostOptions(String objectName, T baseValue, Class<T> clazz,
                                 Function<T, SerializedType> getSerialized, BiConsumer<JsonNode, T> updateDependencies,
                                 String serializedKey) {
        this.objectName = objectName;
        this.baseValue = baseValue;
        this.clazz = clazz;
        this.getSerialized = getSerialized;
        this.updateDependencies = updateDependencies;
        this.serializedKey = serializedKey;
        this.preconditions = new ArrayList<>();
    }

    public String getObjectName() {
        return objectName;
    }

    public ApiServletPostOptions<T, SerializedType> setObjectName(String objectName) {
        this.objectName = objectName;
        return this;
    }

    public T getBaseValue() {
        return baseValue;
    }

    public ApiServletPostOptions<T, SerializedType> setBaseValue(T baseValue) {
        this.baseValue = baseValue;
        return this;
    }

    public Class<T> getClazz() {
        return clazz;
    }

    public ApiServletPostOptions<T, SerializedType> setClazz(Class<T> clazz) {
        this.clazz = clazz;
        return this;
    }

    public BiConsumer<JsonNode, T> getUpdateDependencies() {
        return updateDependencies;
    }

    public ApiServletPostOptions<T, SerializedType> setUpdateDependencies(BiConsumer<JsonNode, T> updateDependencies) {
        this.updateDependencies = updateDependencies;
        return this;
    }

    public Function<T, SerializedType> getGetSerialized() {
        return getSerialized;
    }

    public ApiServletPostOptions<T, SerializedType> setGetSerialized(Function<T, SerializedType> getSerialized) {
        this.getSerialized = getSerialized;
        return this;
    }

    public String getSerializedKey() {
        return serializedKey;
    }

    public ApiServletPostOptions<T, SerializedType> setSerializedKey(String serializedKey) {
        this.serializedKey = serializedKey;
        return this;
    }


    public List<ModifyPrecondition<T>> getPreconditions() {
        return preconditions;
    }

    public ApiServletPostOptions<T, SerializedType> setPreconditions(List<ModifyPrecondition<T>> preconditions) {
        this.preconditions = preconditions;
        return this;
    }
}
