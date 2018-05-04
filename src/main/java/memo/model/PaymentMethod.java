package memo.model;


import java.util.Arrays;

public enum PaymentMethod {
    Bar("Bar"),
    Lastschrift("Lastschrift"),
    Überweisung("Überweisung"),
    Paypal("Paypal");

    String textValue;

    PaymentMethod(String textValue) {
        this.textValue = textValue;
    }

    public String getTextValue() {
        return textValue;
    }

    public static PaymentMethod fromTextValue(String textValue) {
        return Arrays.stream(PaymentMethod.values())
                .filter(it -> it.getTextValue().equalsIgnoreCase(textValue))
                .findFirst()
                .orElse(null);
    }
}
