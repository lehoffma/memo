package memo.model;


public enum PaymentMethod {
    Bar("Bar"),
    Lastschrift("Lastschrift"),
    Überweisung("Überweisung"),
    Paypal("Paypal");

    String textValue;

    PaymentMethod(String textValue){
        this.textValue = textValue;
    }

    public String getTextValue() {
        return textValue;
    }
}
