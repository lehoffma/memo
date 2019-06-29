package memo.serialization;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import memo.model.ClubRole;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class ClubRoleListDeserializer extends StdDeserializer<List<ClubRole>> {

    ClubRoleListDeserializer() {
        super(ClubRole.class);
    }

    protected ClubRoleListDeserializer(Class<?> vc) {
        super(vc);
    }

    protected ClubRoleListDeserializer(JavaType valueType) {
        super(valueType);
    }

    protected ClubRoleListDeserializer(StdDeserializer<?> src) {
        super(src);
    }

    @Override
    public List<ClubRole> deserialize(JsonParser jsonParser, DeserializationContext ctxt) throws IOException, JsonProcessingException {
        List<String> clubRoles = new ArrayList<>();
        while (jsonParser.nextToken() != JsonToken.END_ARRAY) {
            clubRoles.add(jsonParser.getText());
        }

        return clubRoles.stream()
                .map(ClubRole::fromString)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClubRole> getNullValue(DeserializationContext ctxt) throws JsonMappingException {
        return new ArrayList<>();
    }

}
