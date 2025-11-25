## ADDED Requirements

### Requirement: Loading States
The assessment form SHALL display loading indicators during initialization and data persistence operations.

#### Scenario: Form initialization
- **WHEN** the assessment form component mounts
- **THEN** a skeleton loader is displayed until criteria are loaded
- **AND** the skeleton matches the layout of the actual form

#### Scenario: Auto-save feedback
- **WHEN** a user selects an answer or updates a comment
- **THEN** a subtle loading indicator appears during the save operation
- **AND** the indicator disappears when the save completes

### Requirement: Question Transitions
The assessment form SHALL provide smooth visual transitions when navigating between questions.

#### Scenario: Next question transition
- **WHEN** a user clicks the "Next" button
- **THEN** the current question fades out
- **AND** the next question fades in with a 200-300ms duration
- **AND** navigation is disabled during the transition

#### Scenario: Previous question transition
- **WHEN** a user clicks the "Previous" button
- **THEN** the current question fades out
- **AND** the previous question fades in with a 200-300ms duration
- **AND** navigation is disabled during the transition

### Requirement: Answer Selection Feedback
The assessment form SHALL provide visual feedback when answers are selected without redundant icons.

#### Scenario: Compliant answer selection
- **WHEN** a user selects the "Conforme" (compliant) option
- **THEN** the radio button is checked
- **AND** no checkmark icon is displayed next to the label
- **AND** a subtle scale animation is applied to the selected option

## MODIFIED Requirements

### Requirement: Radio Button Styling
Radio buttons for criterion responses SHALL use clean, minimal styling without decorative icons.

#### Scenario: Radio button display
- **WHEN** radio options are rendered
- **THEN** only the radio button and text label are shown
- **AND** no additional icons (checkmarks, etc.) are displayed
- **AND** the selected state is indicated by the radio button alone
