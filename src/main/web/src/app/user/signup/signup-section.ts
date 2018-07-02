export enum SignUpSection {
	AccountData = <any> "account-data",
	PersonalData = <any> "personal-data",
	PaymentMethods = <any> "payment-methods"
}

export function toTitle(section: SignUpSection) {
	switch (section) {
		case SignUpSection.AccountData:
			return "Account Daten";
		case SignUpSection.PaymentMethods:
			return "Bezahlmethoden";
		case SignUpSection.PersonalData:
			return "Persönliche Daten";
	}
}
