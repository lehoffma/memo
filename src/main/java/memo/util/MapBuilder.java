package memo.util;

import java.util.HashMap;
import java.util.Map;

public class MapBuilder<K, V> extends HashMap<K, V> {

    public MapBuilder<K,V> buildPut(K key, V value) {
        this.put(key, value);
        return this;
    }

    public MapBuilder<K,V> buildPutAll(Map<? extends K, ? extends V> values) {
        this.putAll(values);
        return this;
    }

    public static <K, V> MapBuilder<K, V> create() {
        return new MapBuilder<>();
    }

}
