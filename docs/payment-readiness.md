# Payment Readiness and Financial State Ownership

This document defines the customer and partner frontend contract for booking
quotes, payment progress, and refunds. It prepares the app for XentriPay while
keeping provider details behind the Pluto Booking API.

Milestone 4 implements listing checkout controls against the canonical payment
API. It covers authoritative listing quotes, inventory holds, idempotent
mobile-money initiation, canonical status recovery, and verified paid-booking
confirmation. Flight payment, provider webhooks, and refund controls are not
part of this milestone.

## Non-Negotiable Ownership

- The browser may calculate and display a clearly labelled estimate for quick
  feedback. It must never submit that estimate as the amount to charge.
- The backend owns availability checks, inventory holds, discounts, fees,
  taxes, currency validation, rounding, the final payable amount, and quote
  expiry.
- The frontend must render a versioned server quote before payment and submit
  only the server-issued quote identifier or acceptance token.
- The navbar display currency defaults to USD and may be persisted as a local
  preference. It uses the cached public USD/RWF projection for immediate visual
  conversion, but never stores a rate or sends a client-calculated amount.
- The backend owns payment creation, provider credentials, idempotency,
  reconciliation, booking transitions, notification delivery, and refunds.
- A redirect or return URL is navigation only. It is never proof that a payment
  succeeded.
- `PAID`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`, and reversal truth must
  come from the Pluto Booking API after a verified provider event or an
  authoritative reconciliation query.
- XentriPay keys, webhook secrets, raw signatures, and privileged provider
  payloads must never be placed in this project, browser storage, query
  strings, analytics, or logs.
- Frontend types and controls must not expose a mutation that lets customers or
  partners choose a financial status.

## Recommended Booking Sequence

Do not collect money before Pluto Booking has a durable internal reference.
The safe sequence is:

1. The customer chooses dates, quantity, and guest information.
2. The backend checks availability and creates a short-lived inventory hold or
   provisional booking reference.
3. The backend returns an immutable, versioned quote with line items, currency,
   total, and expiry.
4. The customer reviews and explicitly accepts that server quote.
5. The backend creates one idempotent payment attempt for the accepted quote.
6. The frontend displays the returned payment instructions and a pending state.
7. The backend reconciles the transaction through XentriPay's authenticated
   status API. A signed provider event may supplement this only after XentriPay
   documents an authenticated webhook contract.
8. Only verified success confirms the booking. Failure or expiry releases the
   hold safely; an unknown result remains `confirming` until reconciliation.

Quote acceptance includes the exact backend-issued terms version. The frontend
must send that version when creating checkout, and a fresh quote resets the
acceptance control so outdated terms cannot be silently reused.

This gives the customer the experience of paying before a booking is final,
without creating an untraceable payment. For request-to-book inventory, partner
approval may happen before steps 3–5. For instant-book inventory, the hold and
quote can be created immediately. The UI must explain which path applies.

## Flight Request Sequence

Submitting the public flight form creates a request only; it takes no payment.
Staff must prepare an immutable quote with itinerary, fare rules, baggage,
traveler count, line items, currency, total, and expiry. The customer accepts
that exact quote before a payment attempt is created. Payment success may move
the request into ticketing, but it must not imply that a ticket has already
been issued. Ticket confirmation remains a separate operational event.

Changing an itinerary or price invalidates the old quote and requires explicit
acceptance of a new version. The frontend must never reuse an expired or
superseded quote.

## Customer-Facing State Model

Use backend-provided state and copy that tells the customer what is happening:

- `Estimate`: informational browser calculation; not payable truth.
- `Quote ready`: server amount is ready and includes an expiry time.
- `Payment action required`: the customer must complete provider instructions.
- `Payment processing`: the provider has not reached a terminal result.
- `Still confirming`: the result is temporarily unknown; do not call it failed
  and do not invite a duplicate payment.
- `Paid`: shown only after backend verification.
- `Payment failed`: show a safe reason, whether retry is allowed, and a clear
  next action.
- `Quote expired` or `Availability changed`: block payment, explain the change,
  and request a fresh quote.
- `Refund requested`, `Refund processing`, `Partially refunded`, or `Refunded`:
  display backend-owned refund progress and the amount affected.

Never infer success from polling timeout, browser return parameters, a provider
screen, or an HTTP 200 from payment initiation.

## Feedback and Error Rules

Follow `feedback-and-states.md` and these payment-specific rules:

- Put correctable field problems inline beside the affected control.
- Use a blocking dialog when price, currency, quote version, availability, or
  expiry changed and the customer must review before continuing.
- Use a toast for temporary network feedback only when the underlying state is
  still visible on the page.
- During an unknown provider result, keep the payment attempt locked, show
  `Still confirming your payment`, and provide a safe refresh or support path.
- Translate provider failures into plain language and an internal support
  reference. Never expose raw provider codes, stack traces, signatures,
  tokens, or internal identifiers.
- Disable duplicate submissions. A pending submit button shows only its loading
  icon and keeps an accessible label.
- Announce material status changes through an accessible live region and keep
  the same status available after refresh.
- Success copy must state what is confirmed and what happens next. Payment
  success must not over-promise partner approval, ticketing, or settlement.

## Email and Notification Boundary

The browser does not send payment emails. The backend must enqueue durable,
deduplicated notifications after committed state changes. Customer templates
must include the Pluto reference, amount and currency when applicable, a plain
status explanation, the next action, and a support path. They must not include
provider credentials, full payment account data, secrets, or unsafe raw error
text.

Expected notifications include payment instructions, verified success,
terminal failure, quote or hold expiry when useful, refund receipt, and a
material reversal. Delayed email must not delay the canonical in-app status.

## Refund Experience

Customers and partners may request or view a refund only through dedicated API
workflows. They cannot select `REFUNDED` or change the refundable amount in the
browser. The UI must show the original charge, maximum refundable amount,
requested amount, reason, current state, and expected timing returned by the
backend. A refund request remains processing until the backend verifies the
provider result.

## Implemented Listing Checkout Boundary

The customer checkout may be exposed only while the backend provides:

- a server quote identifier, version, line items, currency, total, and expiry;
- an inventory hold or provisional booking reference and expiry behavior;
- idempotent payment-attempt creation without accepting a client amount;
- safe payment status retrieval and a canonical unknown/processing state;
- authenticated provider reconciliation with exact stored-reference matching;
- retry rules that cannot create duplicate charges;
- sanitized customer error codes and support references; and
- durable, deduplicated notification events.

The supplied XentriPay contract does not define signed webhooks or an
original-instrument refund API. The frontend therefore exposes neither a
webhook-derived state nor refund commands, and the backend keeps those
capabilities fail-closed. Do not call XentriPay directly from React components,
persist phone numbers or payment identifiers in browser storage, or expose
provider-specific payloads through shared UI state.

The listing dialog must always show the exact server quote and expiry before
payment. `PROCESSING` and `UNKNOWN` remain recoverable through the account
Payments page, which polls canonical state and may request a rate-limited
authenticated reconciliation without creating another charge.

For a USD listing, quote review also shows the original USD subtotal, locked
USD/RWF rate, and exact RWF amount that XentriPay may collect. Changing the
navbar currency after quote creation does not mutate the quote or payment.
A fresh quote using a changed rate blocks payment until the customer explicitly
reviews the previous rate, new rate, and converted total.
