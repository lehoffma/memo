package memo.serialization;

import javax.enterprise.inject.spi.CDI;
import java.util.function.Supplier;

public class SerializationHelper {

    public static <T> Supplier<T> getByJNDILookup(Class<T> clazz) {
        return () -> {
            //Retrieve the Home interface using JNDI lookup
            return CDI.current().select(clazz).get();
        };
    }
}
