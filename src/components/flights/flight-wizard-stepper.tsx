import { CheckCircle2 } from "lucide-react";
import type { FlightWizardStep } from "./flight-request-types";
import styles from "./flight-request-page.module.css";

export const flightWizardSteps = [
	{
		id: "trip",
		label: "Trip",
		description: "Route and dates",
	},
	{
		id: "traveler",
		label: "Traveler",
		description: "Passenger and contact",
	},
	{
		id: "notes",
		label: "Notes",
		description: "Baggage and requests",
	},
] as const satisfies readonly {
	id: FlightWizardStep;
	label: string;
	description: string;
}[];

type FlightWizardStepperProps = {
	currentStep: FlightWizardStep;
};

export function FlightWizardStepper({ currentStep }: FlightWizardStepperProps) {
	const currentIndex = flightWizardSteps.findIndex(
		(step) => step.id === currentStep,
	);

	return (
		<header className={styles.wizardTopbar}>
			<ol className={styles.stepper} aria-label="Flight request progress">
				{flightWizardSteps.map((step, index) => {
					const isComplete = index < currentIndex;
					const isActive = step.id === currentStep;

					return (
						<li
							key={step.id}
							data-active={isActive}
							data-complete={isComplete}
							aria-current={isActive ? "step" : undefined}
						>
							<span className={styles.stepNumber}>
								{isComplete ? <CheckCircle2 aria-hidden="true" /> : index + 1}
							</span>
							<span className={styles.stepCopy}>
								<strong>{step.label}</strong>
								<small>{step.description}</small>
							</span>
						</li>
					);
				})}
			</ol>
		</header>
	);
}
