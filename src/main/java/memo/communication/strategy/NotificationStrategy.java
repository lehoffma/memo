package memo.communication.strategy;

import java.util.function.Function;

public interface NotificationStrategy<T> {
    default void async(Runnable runnable) {
        new Thread(runnable);
    }

    default <U> U waitFor(Function<T, U> function, T input) {
        return function.apply(input);
    }

    void get(T item);

    void post(T item);

    void put(T item, T previous);

    void delete(T item);
}
