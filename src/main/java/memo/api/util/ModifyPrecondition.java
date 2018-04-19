package memo.api.util;

import java.util.function.Predicate;

public class ModifyPrecondition<T> {
    private Predicate<T> predicate;
    private String errorMessage;
    private Runnable consequence;   //what happens if the predicate is not fulfilled

    public ModifyPrecondition(Predicate<T> predicate,
                              String errorMessage,
                              Runnable consequence) {
        this.predicate = predicate;
        this.errorMessage = errorMessage;
        this.consequence = consequence;
    }

    public Predicate<T> getPredicate() {
        return predicate;
    }

    public ModifyPrecondition<T> setPredicate(Predicate<T> predicate) {
        this.predicate = predicate;
        return this;
    }

    public Runnable getConsequence() {
        return consequence;
    }

    public ModifyPrecondition<T> setConsequence(Runnable consequence) {
        this.consequence = consequence;
        return this;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public ModifyPrecondition<T> setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
        return this;
    }
}
