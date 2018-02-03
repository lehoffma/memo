package memo.serialization;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import memo.data.Repository;

import java.io.IOException;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Supplier;

public class IdDeserializer<T> extends StdDeserializer<T> {

    protected Supplier<Repository<T>> getRepository;
    protected BiFunction<Repository<T>, String, Optional<T>> getById;

    protected IdDeserializer(Supplier<Repository<T>> getRepository, BiFunction<Repository<T>, String, Optional<T>> getById, Class<T> vc) {
        super(vc);
        this.getRepository = getRepository;
        this.getById = getById;
    }

    protected IdDeserializer(Class<?> vc) {
        super(vc);
    }

    protected IdDeserializer(JavaType valueType) {
        super(valueType);
    }

    protected IdDeserializer(StdDeserializer<?> src) {
        super(src);
    }

    @Override
    public T deserialize(JsonParser jsonParser, DeserializationContext context) throws IOException, JsonProcessingException {
        String id = jsonParser.getText();

        Repository<T> repository = this.getRepository.get();
        return getById.apply(repository, id).orElse(null);
    }
}
