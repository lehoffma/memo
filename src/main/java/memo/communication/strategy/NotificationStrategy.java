package memo.communication.strategy;

import java.util.function.Function;

public interface NotificationStrategy<T> {
    default void async(Runnable runnable) {
        Thread thread = new Thread(runnable);
        thread.start();
    }

    default <U> U waitFor(Function<T, U> function, T input) {
        return function.apply(input);
    }

    void get(T item);

    void post(T item);

    void put(T item, T previous);

    void delete(T item);
}
