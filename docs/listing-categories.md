# Listing Category Rules

These rules protect the multi-category listing workflow.

## Supported Categories

- `CAR`
- `APARTMENT`
- `HOTEL_ROOM`
- `AIRBNB_HOUSE`

## Frontend Rules

- Never hardcode partner listings as car-only unless the component is explicitly a car detail section.
- Listing create and edit flows must keep category selection as the first wizard step.
- Category cannot be changed in edit mode because each category writes to a different backend detail model.
- Category-specific forms must send only the fields required for the selected category plus shared product fields.
- Public, partner, and admin listing views must show the product category clearly.
- Detail views must render the correct detail model:
  - `carDetails` for cars.
  - `apartmentDetails` for apartments.
  - `hotelRoomDetails` for hotel rooms.
  - `airbnbDetails` for Airbnb homes.
- Empty category detail data must not be displayed as a car fallback unless `category` is `CAR`.

## API Rules

- Use one endpoint file per request under `src/services/api/products` or `src/services/api/partner-products`.
- Shared product fields belong in typed base request shapes.
- Category request types must stay aligned with backend DTOs.
- Keep public product list requests category-filterable.

## Review Rules

- Admin review must inspect category-specific facts before approval or rejection.
- Review decisions must remain professional and partner-facing messages must not expose backend routes or implementation details.
- Product detail dialogs and pages must support images, price, owner/partner context, status, and category facts.
