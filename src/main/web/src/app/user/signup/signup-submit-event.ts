import {SignUpSection} from "./signup-section";
export interface SignUpSubmitEvent {
	section: SignUpSection,
	email?: string,
	passwordHash?: string,
	firstName?: string,
	surname?: string,
	birthday?: Date,
	phoneNumber?: string,
	isStudent?: boolean
}
