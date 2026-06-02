# Karigar: E-Commerce Platform Technical Evaluation and Verification Guide

This evaluation guide defines systematic verification workflows to assist technical auditors, evaluators, and reviewers in comprehensively testing the Karigar e-commerce marketplace. It covers step-by-step procedures for validating user accounts, catalog searches, transactions, security measures, and database encryption.

---

## 1. System Environment Verification

Before executing the verification flows, confirm that both backend and frontend environments are compiled and running:

*   **Frontend Client Interface**: Accessible at `http://localhost:5173`
*   **Backend REST Gateway**: Accessible at `http://localhost:5000/api/health` (should return `{"success":true,"status":"healthy","message":"Karigar API is running securely"}`)
*   **Database Engine**: MongoDB instance is online and has been hydrated via `npm run seed` within the `/backend` directory.

---

## 2. Evaluation Credential Matrix

Use the following pre-configured credentials to execute the evaluation workflows for each role:

| Account Type | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Buyer (Customer)** | `buyer@test.com` | `password123` | Storefront browsing, cart interactions, address setups, payment checkout simulation, product reviews. |
| **Artisan (Seller)** | `artisan@test.com` | `password123` | Shop management, product catalogs creation/modification, order tracking panels, KYC documents submission. |
| **Administrator** | `admin@test.com` | `password123` | Complete KYC moderation boards, product listings moderation, user authorization controls, server state inspections. |

*Note: The admin account can be seeded or created by registering a normal account and modifying its role property in the MongoDB database collection to `admin`.*

---

## 3. Technical Evaluation Workflows

### Flow A: Multi-Role Authentication and Registration
This flow validates role-based authorization, JWT cookie setting, and access control.

1.  Navigate to the login interface at `http://localhost:5173/login`.
2.  Authenticate using the Buyer credentials:
    *   **Email**: `buyer@test.com`
    *   **Password**: `password123`
3.  Upon successful redirection, open the browser Developer Tools (F12) -> Application -> Cookies. Verify that the cookie `karigar_token` is present, marked as `HttpOnly`, and has its `Secure` parameter flagged if running over HTTPS.
4.  Logout and navigate to `http://localhost:5173/register` to test new user creation.
5.  Register a new account. Toggle the role selector between **Buyer** and **Artisan** to confirm that the client-side routes are dynamically mapped based on the registered role.

---

### Flow B: Regional Crafts Explorer and Catalog Filtration
This flow verifies geographic data mapping, category filtering, and text-based search indexing.

1.  Navigate to the Home Page at `http://localhost:5173`.
2.  Scroll to the **Regional Crafts Explorer** interactive map.
3.  Click on a state (e.g., **Rajasthan** or **Odisha**). Observe that the sidebar catalog updates dynamically to display crafts originating from that specific state (e.g., Blue Pottery for Rajasthan, Pattachitra for Odisha).
4.  Click the **Explore The Arts** button to navigate to the full catalog page (`/products`).
5.  Test the filter controllers:
    *   Filter by craft category (e.g., **Textiles & Weaving**).
    *   Adjust the price range slider.
    *   Select specific state origins.
6.  Test the text search bar: Enter a query (e.g., `saree` or `pottery`). The backend database utilizes text-based indexing on the `name`, `description`, and `tags` fields to return matching records.

---

### Flow C: Persistent Cart Operations and Multi-Vendor Checkout
This flow validates cart persistence across sessions, Razorpay mock payment verification, and order generation.

1.  Ensure you are authenticated as a Buyer.
2.  Browse the catalog and add multiple products to the cart. Ensure you add items originating from different artisans (e.g., one blue pottery item and one Kanjeevaram saree).
3.  Navigate to the Cart Page (`/cart`). Modify item quantities and verify that the subtotal, estimated tax (5% GST), and totals update reactively.
4.  Close the browser tab, reopen `http://localhost:5173/cart`, and verify that the items remain persisted (hydrated from the backend MongoDB Cart collection).
5.  Click **Proceed to Checkout**. Select or create a shipping address.
6.  Click **Place Order**. This initiates an API call to `/api/orders/create-razorpay-order` to generate a secure Razorpay order token.
7.  The custom Razorpay Payment Modal will render:
    *   **To simulate a successful payment**: Enter the test card number `4111 1111 1111 1111` with any future expiry date and a 3-digit CVV.
    *   **To simulate a failed payment**: Enter `4444 3333 2222 1111`.
8.  Complete the successful transaction. Verify that you are redirected to the Order Success page and presented with a unique tracking number (e.g., `KGR-XXXXXX-XXXX`).

---

### Flow D: Artisan Storefront Customization
This flow validates seller branding modifications and dashboard analytics.

1.  Authenticate using the Artisan credentials:
    *   **Email**: `artisan@test.com`
    *   **Password**: `password123`
2.  Navigate to the Seller Dashboard (`/dashboard`).
3.  Verify that the analytics widgets correctly display key business metrics: **Total Sales Count**, **Total Revenue** (in INR), **Average Product Rating**, and **Active Inventory Count**.
4.  Navigate to **Shop Settings**.
5.  Modify your shop details: Update the **Shop Name**, **Tagline**, and **Artisan Story** description.
6.  Upload mock image files for the **Shop Logo** and **Shop Banner**. The backend uploads these binaries to Cloudinary via Multer, updates the `ArtisanProfile` database record, and deletes the old assets on the Cloudinary server.
7.  Verify the updates by viewing your public artisan profile page.

---

### Flow E: Encrypted KYC Submission and Database Audit
This flow validates compliance with data protection standards through database field-level encryption.

1.  While logged in as the Artisan, navigate to the **KYC Verification** tab on your dashboard.
2.  Provide mock credentials:
    *   **Aadhaar Number**: `1234 5678 9012`
    *   **PAN Number**: `ABCDE1234F`
    *   **Bank Account Details**: Provide Bank Name, Account Number, and IFSC Code.
3.  Upload mock PDF or image files for the Aadhaar and PAN documents.
4.  Click **Submit KYC**. The status will update to **Pending Verification**.

#### 🔬 Database Audit Procedure
To prove that sensitive PII (Personally Identifiable Information) is encrypted at the database level:
1.  Open your MongoDB shell or MongoDB Compass interface.
2.  Select the `karigar_marketplace` database and execute a find query on the `artisanprofiles` collection:
    ```javascript
    db.artisanprofiles.find({ shopName: "Jaipur Blue Pottery Studio" }).pretty()
    ```
3.  **Expected Output**:
    *   Standard fields like `shopName`, `tagline`, `story`, and `yearsOfExperience` will render in clear, plain text.
    *   The protected fields under the `kyc` object (`aadhaarNumber`, `panNumber`, and `bankAccountNumber`) will appear as heavily obfuscated, hexadecimal cryptographic strings (cipher text).
    *   This confirms that even if the database layer is compromised, the sensitive documents and credentials remain fully protected by AES-256-CBC encryption.

---

### Flow F: Administrative KYC Moderation
This flow validates administrative dashboards, product moderation, and approval flows.

1.  Access your database management tool (Compass/Mongo Shell).
2.  Locate the User document for the account you wish to make an Admin (or the pre-seeded admin user, if configured).
3.  Modify the user's `role` field from `buyer` or `artisan` to `admin` and save the changes.
4.  Log out of the application and log back in using the modified administrator credentials.
5.  Navigate to the Admin Dashboard (`/admin/dashboard`).
6.  Locate the **KYC Approvals** panel. The pending KYC request submitted in **Flow E** will be listed.
7.  Click **Review Documents**. Examine the uploaded mock files and numbers.
8.  Select **Approve** or **Reject** (if rejecting, provide a structured reason).
9.  Log back in as the Artisan. Verify that your verification badge is active and the shop status has updated accordingly.

---

## 4. Structural Security Verification

### Zod Form Validations
Navigate to any form (e.g., registration or product listing). Submit empty or malformed inputs. Verify that the frontend UI immediately prevents submission and displays contextual validation errors (e.g., "Please provide a valid Indian mobile number" or "Password must be at least 6 characters").

### CORS and API Protection
Attempt to access a protected API route directly through a browser or API client (such as Postman) without an active session cookie (e.g., `GET http://localhost:5000/api/orders/my-orders`). Verify that the server returns an HTTP status code `401 Unauthorized` and the JSON response:
```json
{
  "success": false,
  "message": "Access denied. Please log in to continue."
}
```

---

**This concludes the technical evaluation workflows. For questions or deployment setups, refer to the parent README.md documentation.**
