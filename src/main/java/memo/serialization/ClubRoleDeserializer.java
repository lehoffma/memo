package memo.serialization;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import memo.data.UserRepository;
import memo.model.ClubRole;

import java.io.IOException;

public class ClubRoleDeserializer extends StdDeserializer<ClubRole> {
    public ClubRoleDeserializer() {
        super(ClubRole.class);
    }

    @Override
    public ClubRole getNullValue(DeserializationContext ctxt) throws JsonMappingException {
        return ClubRole.Gast;
    }

    @Override
    public ClubRole deserialize(JsonParser jsonParser, DeserializationContext ctxt) throws IOException, JsonProcessingException {
        String textValue = jsonParser.getText();

        return UserRepository.clubRoleFromString(textValue)
                .orElse(ClubRole.Gast);
    }
}
