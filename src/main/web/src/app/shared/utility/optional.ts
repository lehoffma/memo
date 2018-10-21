export class Optional<T> {
	private readonly _value: T;

	constructor(value: T) {
		this._value = value;
	}

	get() {
		return this._value;
	}

	static of<T>(value: T) {
		return new Optional(value);
	}

	static empty() {
		return new Optional(null);
	}

	private isUndefined() {
		return this._value === null || this._value === undefined;
	}

	map<U>(f: (input: T) => U): Optional<U> {
		if (this.isUndefined()) {
			return Optional.empty();
		}
		return Optional.of(f(this.get()));
	}

	flatMap<U>(f: (input: T) => Optional<U>): Optional<U> {
		if (this.isUndefined()) {
			return Optional.empty();
		}
		return f(this.get());
	}

	ifPresent(f: (input: T) => void) {
		if (this.isUndefined()) {
			return;
		}
		f(this.get());
	}

	orElse(defaultValue: T): T {
		if (this.isUndefined()) {
			return defaultValue;
		}
		return this.get();
	}
}
