# Implementation Plan - Weaker Non-Interactive Gooey Bubble Background for Sections

## User Review Required
> [!IMPORTANT]
> Please review the plan below. Clicking 'Proceed' will execute the implementation.

- **Effect Style**: Subtler version of GooeyGradientBackground (opacity set to 30%, interactive mouse-following disabled).
- **Target Sections**:
  1. `section#services` (Services Portfolio Showcase)
  2. `section#booking` (Booking Calendar)
  3. `section#experiences` (Client Experiences Gallery)

## Proposed Changes

### 1. Update GooeyGradientBackground Component
- Add an `interactive={false}` prop and an `opacity` or `intensity` modifier (e.g. `opacity-30`) so it renders as a softer, static animated background without mouse tracking.

### 2. Integrate into Sections
- Wrap `ServicesShowcase`, `BookingSection`, and `ExperiencesSection` with the weaker `GooeyGradientBackground`.

## Verification Plan
- Compile and lint applet.
- Verify smooth background animations across sections without mouse interaction.
