package memo.serialization;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

public class IdListSerializer<T, IdType> extends StdSerializer<List<T>> {

    protected Function<T, IdType> getId;

    protected IdListSerializer(Function<T, IdType> getId, Class<T> t) {
        super(t, false);
        this.getId = getId;
    }

    protected IdListSerializer(JavaType type) {
        super(type);
    }

    protected IdListSerializer(Class<?> t, boolean dummy) {
        super(t, dummy);
    }

    protected IdListSerializer(StdSerializer<?> src) {
        super(src);
    }

    @Override
    public void serialize(List<T> value, JsonGenerator gen, SerializerProvider provider) throws IOException {
        List<IdType> ids = new ArrayList<>(value).stream().map(it -> getId.apply(it)).collect(Collectors.toList());

        new ObjectMapper().writeValue(gen, ids);
    }
}
