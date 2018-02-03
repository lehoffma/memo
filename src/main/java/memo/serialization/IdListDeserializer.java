package memo.serialization;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import memo.data.Repository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.BiFunction;
import java.util.function.Supplier;
import java.util.stream.Collectors;

public class IdListDeserializer<T> extends StdDeserializer<List<T>> {

    protected Supplier<Repository<T>> getRepository;
    protected BiFunction<Repository<T>, String, Optional<T>> getById;

    protected IdListDeserializer(Supplier<Repository<T>> getRepository, BiFunction<Repository<T>, String, Optional<T>> getById, Class<T> vc) {
        super(vc);
        this.getRepository = getRepository;
        this.getById = getById;
    }

    protected IdListDeserializer(Class<?> vc) {
        super(vc);
    }

    protected IdListDeserializer(JavaType valueType) {
        super(valueType);
    }

    protected IdListDeserializer(StdDeserializer<?> src) {
        super(src);
    }

    @Override
    public List<T> deserialize(JsonParser jsonParser, DeserializationContext context) throws IOException, JsonProcessingException {
        List<String> ids = new ArrayList<>();
        while (jsonParser.nextToken() != JsonToken.END_ARRAY) {
            ids.add(jsonParser.getText());
        }

        Repository<T> repository = this.getRepository.get();
        return ids.stream()
                .map(id -> getById.apply(repository, id))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }
}
