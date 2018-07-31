package memo.data.util;

import java.io.IOException;
import java.util.List;

public interface Converter<FROM, TO> {
    TO convert(FROM from) throws IOException;

    TO convertList(List<FROM> from) throws IOException;
}
