# React Native Design Principles

These principles are mandatory for this Android POS app.

## 1. Visual Identity

- Primary palette uses dark green with cream/light yellow accents.
- UI should feel premium, warm, clean, modern, and professional.
- Avoid generic blue dashboard aesthetics.
- Keep strong contrast while preserving comfort and clarity.

## 2. Design System

- Use centralized theme tokens for colors, spacing, typography, borders, radius, and shadows.
- Do not hardcode repeated visual values across components.
- Reuse existing tokens before introducing new ones.

## 3. Reusable Components

- Build reusable components for repeated UI patterns.
- Core components include buttons, inputs, cards, headers, badges, search fields, modals, bottom sheets, loading states, empty states, and error states.
- POS components include product cards, cart items, price displays, payment methods, order status, and customer information.
- Repeated components must look and behave consistently.

## 4. Layout

- Prefer clean layouts with generous spacing and clear hierarchy.
- Keep screens simple and focused.
- Avoid unnecessary visual noise.
- Use rounded corners consistently.
- Keep primary actions obvious.

## 5. Typography

- Use a consistent typography scale.
- Prioritize readability and hierarchy.
- Prices, totals, and key POS information need strong emphasis.

## 6. Interaction

- Components must support pressed, disabled, loading, selected, and error states where applicable.
- Keep interactions responsive and predictable.
- Use subtle motion only when it improves usability.

## 7. Consistency

- Do not create one-off patterns when existing components fit.
- Every screen should clearly belong to the same app.
- New components must follow the visual language.

## 8. Simplicity

- Prefer simple, readable interfaces over visual complexity.
- Every visual element must serve a purpose.
- Do not over-design the application.
