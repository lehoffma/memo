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
    private Function<T, T> transform;
    private Function<T, SerializedType> getSerialized;
    private List<ModifyPrecondition<T>> preconditions = new ArrayList<>();
    private String serializedKey;

    public ApiServletPostOptions() {
        this.transform = Function.identity();
        this.serializedKey = "id";
    }

    public ApiServletPostOptions(String objectName, T baseValue, Class<T> clazz, Function<T, SerializedType> getSerialized) {
        this(objectName, baseValue, clazz, getSerialized, Function.identity(), "id");
    }

    public ApiServletPostOptions(String objectName, T baseValue, Class<T> clazz,
                                 Function<T, SerializedType> getSerialized, Function<T, T> transform) {
        this(objectName, baseValue, clazz, getSerialized, transform, "id");

    }

    public ApiServletPostOptions(String objectName, T baseValue, Class<T> clazz,
                                 Function<T, SerializedType> getSerialized, Function<T, T> transform,
                                 String serializedKey) {
        this.objectName = objectName;
        this.baseValue = baseValue;
        this.clazz = clazz;
        this.getSerialized = getSerialized;
        this.transform = transform;
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

    public Function<T, T> getTransform() {
        return transform;
    }

    public ApiServletPostOptions<T, SerializedType> setTransform(Function<T, T> transform) {
        this.transform = transform;
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
