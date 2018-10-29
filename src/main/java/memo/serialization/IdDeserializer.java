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

public class IdDeserializer<T, RepositoryType extends Repository<T>> extends StdDeserializer<T> {

    protected Supplier<RepositoryType> getRepository;
    protected BiFunction<RepositoryType, String, Optional<T>> getById;

    protected IdDeserializer(Class<RepositoryType> repositoryClass, BiFunction<RepositoryType, String, Optional<T>> getById, Class<T> vc) {
        super(vc);
        this.getRepository = SerializationHelper.getByJNDILookup(repositoryClass);
        this.getById = getById;
    }


    protected IdDeserializer(Supplier<RepositoryType> getRepository, BiFunction<RepositoryType, String, Optional<T>> getById, Class<T> vc) {
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

        RepositoryType repository = this.getRepository.get();
        return getById.apply(repository, id).orElse(null);
    }
}
