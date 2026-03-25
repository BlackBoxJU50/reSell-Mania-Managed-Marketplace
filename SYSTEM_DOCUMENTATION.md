# reSell Mania — Technical Ecosystem Documentation

## 1. Vision & Core Philosophy
**reSell Mania** is a managed marketplace designed for high-trust asset exchange. Unlike traditional open markets, it utilizes a **Custodian-Mediated Workflow** where every asset and transaction is vetted or secured by an central authority.

---

## 2. Technical Architecture (MERN)
The platform is built on a modern full-stack architecture:
- **Frontend**: React (Vite) with Tailwind CSS v4 and Framer Motion for high-end aesthetics.
- **Backend**: Node.js & Express REST API (Following FastAPI documentation standards via Swagger).
- **Database**: MongoDB (NoSQL) for highly flexible asset modeling.
- **Security**: JWT-based session management with role-based access control (RBAC).

---

## 3. The Dual-Stream Financial Ledger
The most critical innovation is our **Clearinghouse Protocol**:
- **Protocol 1 (Inbound)**: Total visibility over gross funds moving from Buyers into the platform Escrow.
- **Protocol 2 (Outbound)**: Automated payout calculation.
- **The 90/10 Logic**: The system calculates a 10% Platform Fee server-side. Sellers receive 90% only after the "Custodian" confirms the physical/legal transfer of the asset.

---

## 4. The Digital Vault & Verified Certificates
To prevent fraud, reSell Mania generates a **Verified Ownership Certificate (VOC)** for every settled transaction:
- **QR Integration**: Every certificate contains a unique QR code.
- **Blockchain-ready Schema**: The certificate metadata is stored in a way that can be easily migrated to a blockchain if greater immutability is required later.
- **Trust Badge**: Assets only receive the "Custodian Verified" badge after being vetted in the Admin Portal.

---

## 5. Administrative Command Center
We have consolidated all database management into the **Custodian Command Center**:
1. **Financial Clearinghouse**: Confirm payments and release seller funds.
2. **Asset Verification**: Approve or deny new listings before they go live.
3. **System Entities**: Direct CRUD (Create, Read, Update, Delete) management for Users and Assets, removing the need for external database tools.
4. **Health Metrics**: Real-time tracking of platform volume, user growth, and inventory levels.

---

## 6. Key Workflows
### Listing an Asset (Liquidation)
`Seller -> Form -> PENDING_VERIFICATION -> [Admin Review] -> LIVE`

### Acquiring an Asset (Acquisition)
`Buyer -> Purchase -> AWAITING_FUNDS -> [Admin Confirm] -> FUNDS_CAPTURED -> [Asset Transfer] -> [Admin Settle] -> SELLER_PAID + VOC Generated`

---

## 7. Developer & Maintenance Operations
- **API Docs**: Accessible at `/api-docs` (Swagger UI).
- **Database**: Standard MongoDB URI configuration in `.env`.
- **Styling Tokens**: Custom CSS variables defined in `index.css` for easy brand adjustment.

---

