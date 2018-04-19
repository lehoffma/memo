package memo.util;

import java.util.ArrayList;
import java.util.Collection;

public class ListBuilder<T> extends ArrayList<T> {

    public ListBuilder<T> buildAdd(T value){
        this.add(value);
        return this;
    }

    public ListBuilder<T> buildAll(Collection<? extends T> values){
        this.addAll(values);
        return this;
    }
}
