# POS Web App - Project Guidelines & Rules

## Tech Stack & Versions
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + restyled shadcn/ui components (FreshCart Forest Green theme)
- **Database**: PostgreSQL + Prisma ORM 6
- **Validation**: Zod (all API inputs, forms, and transactions)
- **Authentication**: JWT / Session with Role-Based Access Control (`admin`, `cashier`)
- **Backend**: Next.js Route Handlers & Server Actions

## FreshCart Theme Variables
- Primary Forest Green: `#017051`
- Primary Hover: `#015c43`
- Secondary Soft Mint: `#EEF7EE`
- App Background: `#F8FAFC`
- Card Surfaces: `#FFFFFF`
- Border: `#EEEEEE`
- Slate Text: `#0F1728`
- Muted Text: `#667084`
- Rounded Radii: `14px` (cards/inputs), `16px` (containers), `100px` (pills/buttons)

## Core Architectural Rules
1. **Strict File Structure**:
   - `/app` - Next.js App Router pages and API route handlers
   - `/components` - Modular, small UI components organized by domain (`/pos`, `/admin`, `/ui`, `/shared`)
   - `/lib` - Utilities, printer adapters, auth tokens, database client
   - `/services` - Business logic (sales, products, reports, inventory transactions)
   - `/prisma` - Schema definition, migrations, and seed script
2. **Quality & Validation**:
   - Validate every mutation with Zod schemas.
   - Run `npx tsc --noEmit` and check for linter errors after every change.
   - Maintain documentation and preserve comments.
3. **Cashier Keyboard Shortcuts**:
   - `F2` -> Trigger Payment Modal / Calculate Pay
   - `F4` -> Hold Current Sale / View Held Sales
   - `Esc` -> Cancel / Clear current cart or close modal
4. **Receipt Printing**:
   - Adapter pattern: `PrinterAdapter` (`connect()`, `printReceipt(sale)`, `openDrawer()`, `status()`).
   - Implementations: `MockPrinter` (default 80mm preview + ESC/POS log), `QZTrayPrinter`, `WebSerialPrinter`.
   - On payment submit: save sale in DB first, then trigger print & kick drawer automatically. Never fail the sale if printing fails; show "Reprint" button.
5. **Languages & RTL**:
   - English (`en`) and Sorani Kurdish (`ckb`).
   - RTL/LTR layout supported via logical Tailwind classes (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`).
