package memo.serialization;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import java.io.IOException;
import java.util.function.Function;

public class IdSerializer<T, IdType> extends StdSerializer<T> {
    protected Function<T, IdType> getId;

    protected IdSerializer(Function<T, IdType> getId, Class<T> t) {
        super(t);
        this.getId = getId;
    }


    @Override
    public void serialize(T value, JsonGenerator gen, SerializerProvider provider) throws IOException {
        gen.writeString(getId.apply(value).toString());
    }
}
