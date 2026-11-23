# Sebez Cafe website

A responsive, no-build-step cafe website. It includes menu filtering/search, a shopping cart, pickup/delivery checkout, a Google Maps location panel, and a browser-based delivery-distance estimate.

## Run it locally

1. Extract the ZIP.
2. Open the `sebez-cafe` folder in VS Code.
3. Start the page with the VS Code **Live Server** extension, or upload the folder to a static host.
4. The browser's location check works on `https://` sites and `localhost` (not ordinary insecure `http://` pages).

## Two settings to complete before launch

### 1) Add the cafe's WhatsApp number

Open `app.js` and replace:

```js
const BUSINESS_WHATSAPP = '2519XXXXXXXX';
```

with the cafe's official WhatsApp number, country code first, digits only. Example format: `2519XXXXXXXX`. Once set, the checkout button opens WhatsApp with the customer's items, contact details, address and notes ready to send. Without this, the site displays a copyable order summary instead of sending it anywhere.

### 2) Verify the location pin

The map and distance check are configured to Hani Super Market / Akaki Kality, Addis Ababa at approximately `8.895024, 38.773635`. Confirm this is the cafe's exact pin before publishing. Update the `CAFE` object near the top of `app.js` if the cafe is elsewhere.

The website measures **straight-line GPS distance**, not road distance. Delivery is available only within 10 km. Beyond 10 km, the site displays “Sorry, delivery service is unavailable in your area” and blocks delivery checkout. Customers must check their location before placing a delivery order; pickup remains available. The cafe should confirm the actual road route and delivery fee.

## Menu data

Edit `menu-data.js` to change item names, descriptions and prices. The three wrap names/descriptions are readable in the supplied menu photo. Many Amharic dish/drink names are blurred in the images, so those entries currently have numbered temporary names (for example, `Juice 01` and `Local favourite 01`). Their listed prices were copied from the visible price columns, but every name and price should be checked against the cafe's current printed menu before launch. Do not publish unverified placeholders as the final menu. The printed Mojito section is deliberately not orderable until the cafe confirms it is alcohol-free.

## Orders and payments

This first version sends the order summary to WhatsApp. It does **not** charge cards, process online payments, save orders to a database, or automatically dispatch drivers. The cafe confirms availability, delivery fee, timing and payment method directly with the customer.

## Files

- `index.html` – website structure
- `styles.css` – responsive design
- `app.js` – search, cart, delivery check and WhatsApp order flow
- `menu-data.js` – editable menu and prices
- `assets/sebez-logo.jpg` – crop of the supplied Sebez Cafe sign logo
