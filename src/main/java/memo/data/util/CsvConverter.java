package memo.data.util;

import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;

import java.io.IOException;
import java.util.List;

public class CsvConverter<T> implements Converter<T, String> {

    private static final CsvMapper mapper = new CsvMapper();

    public CsvConverter() {
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }

    @Override
    public String convert(T object) throws IOException {
        return this.convert(object, false);
    }

    public String convert(T object, Boolean withHeader) throws IOException {
        CsvSchema schema = mapper.schemaFor(object.getClass());
        if (withHeader) {
            schema = mapper.schemaWithHeader().withColumnsFrom(schema);
        }
        ObjectWriter writer = mapper.writer(schema);
        return writer.writeValueAsString(object);
    }

    public String convertList(List<T> objects) throws IOException {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < objects.size(); i++) {
            builder.append(this.convert(objects.get(i), i == 0));
        }

        return builder.toString();
    }
}
