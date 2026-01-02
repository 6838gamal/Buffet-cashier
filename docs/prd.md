# Buffet Cashier System Requirements Document

## 1. Application Overview

### 1.1 Application Name\nBuffet Cashier System\n
### 1.2 Application Description
A comprehensive Point of Sale (POS) system designed for buffet restaurants and food service businesses. The system manages sales transactions, inventory tracking, customer relationships, employee management, and business reporting with offline capability and thermal receipt printing support. The system features role-based access control with separate registration and login flows for Managers and Cashiers.
\n## 2. Functional Requirements

### 2.1 User Authentication
- **Separate Registration Flows**:
  - Manager Registration: Full account creation with store setup
  - Cashier Registration: Account creation linked to specific store (requires manager approval or invitation code)
- **Separate Login Flows**:
  - Manager Login: Username/email, password, store selection (if managing multiple stores)\n  - Cashier Login: Username/email, password, automatic store assignment
- Role identification during login process
- Secure logout functionality
- Role-based access control with clear separation between Manager and Cashier roles

### 2.2 Point of Sale (POS)
- Product grid display for quick selection
- Search and barcode scanning functionality
- Shopping cart management with quantity selection
- Discount application
- Checkout process
- Payment processing with multiple payment methods
- Amount received calculation and change display
- Thermal receipt generation and printing (55mm or 80mm paper size)
- Receipt format similar to restaurant/cafe thermal printers

### 2.3 Sales Management
- View all invoices with search and filter capabilities
- Invoice details display
- Refund processing\n- Receipt reprinting
- **Role-based viewing**: Cashiers see only their own transactions, Managers see all transactions

### 2.4 Product Management
- Dedicated product entry screen
- Add, edit, and delete products
- Product pricing management
- Product image upload
- Barcode management
- **Manager-only access**

### 2.5 Inventory Management
- Real-time stock level tracking
- Low-stock alerts
- Stock movement history
- **Manager-only access**

### 2.6 Customer Management
- Customer database management
- Purchase history tracking
- Loyalty points system

### 2.7 Reporting
- Daily sales reports
- Period-based reports
- Profit analysis
- Top-selling products reports
- Staff performance tracking
- Export functionality (CSV/PDF formats)
- **Role-based access**: Managers have full access, Cashiers have limited access to their own performance reports

### 2.8 Employee Management
- Staff account creation and management
- Role and permission assignment (Manager and Cashier)
- Sales tracking per employee
- Cashier invitation/approval system
- **Manager-only access**
\n### 2.9 Expense Management
- Record daily expenses (rent, utilities, purchases)
- Expense categorization
- **Manager-only access**

### 2.10 System Settings
- Store information configuration
- Tax settings
- Currency configuration
- Thermal printer setup (55mm and 80mm paper size support)
- Language selection
- Data backup and restore\n- **Manager-only access**

### 2.11 Sync and Offline Mode
- Connection status display
- Automatic synchronization after each transaction
- Manual data synchronization option
- Offline operation capability\n- Printer support in offline mode

### 2.12 Multi-language Support
- Support for language switching via text variables
- Language switcher available in the side menu (navigation drawer)
- Supported languages: English and Arabic
- All UI elements, labels, buttons, and messages should be translatable
- Language preference saved per user account
- RTL (Right-to-Left) layout support for Arabic language

## 3. User Roles and Permissions

### 3.1 Manager Role
- **Registration**: Independent registration with store creation
- **Access Level**: Full system access\n- **Permissions**:
  - All POS operations
  - View all sales transactions
  - Product management (add/edit/delete)
  - Inventory management
  - Customer management\n  - Full reports access
  - Employee management (create/edit/delete cashier accounts)
  - Expense management
  - System settings configuration
  - Data backup and restore
  - Language switching
\n### 3.2 Cashier Role
- **Registration**: Registration linked to store (via invitation code or manager approval)
- **Access Level**: Limited operational access
- **Permissions**:
  - POS operations
  - View own sales transactions only
  - Customer management (add/edit customer information)
  - Limited reporting access (own performance only)
  - Language switching\n  - No access to: Products, Inventory, Employees, Expenses, Settings\n
## 4. Navigation Structure

### 4.1 Manager Side Menu (Navigation Drawer)
1. Point of Sale (POS)
2. Sales (All Transactions)
3. Products
4. Inventory
5. Customers
6. Reports (Full Access)
7. Employees
8. Expenses
9. Settings\n10. Sync / Offline Mode
11. Language Switcher (English / Arabic)
12. Logout\n
### 4.2 Cashier Side Menu (Navigation Drawer)
1. Point of Sale (POS)
2. Sales (Own Transactions Only)
3. Customers
4. Reports (Limited Access)
5. Sync / Offline Mode
6. Language Switcher (English / Arabic)
7. Logout

## 5. Screen Flow

### 5.1 Main Screens
1. **Splash Screen**: App logo and system initialization\n2. **Role Selection Screen**: Choose user type (Manager or Cashier)
3. **Manager Registration Screen**: Store setup, account creation\n4. **Cashier Registration Screen**: Store code/invitation input, account creation
5. **Manager Login Screen**: Username/email, password, store selection (if multiple)
6. **Cashier Login Screen**: Username/email, password
7. **Product Entry Screen**: Dedicated screen for adding and managing products (Manager only)
8. **POS Screen**: Product selection, quantity input, cart management, checkout
9. **Payment Screen**: Payment method, amount received, confirm, thermal receipt printing
10. **Sales Screen**: Invoice list with role-based filtering, invoice details, refunds
11. **Products Screen**: Product list, add/edit product, pricing, stock (Manager only)
12. **Inventory Screen**: Stock levels, alerts, stock history (Manager only)
13. **Customers Screen**: Customer list, loyalty points, purchase history\n14. **Reports Screen**: Daily/period reports with role-based access, export CSV/PDF
15. **Employees Screen**: Staff management (Manager only)
16. **Expenses Screen**: Expense tracking (Manager only)
17. **Settings Screen**: Store setup, tax, thermal printer configuration, language, backup (Manager only)

## 6. Technical Requirements

### 6.1 Data Management\n- Local data storage for offline functionality
- Cloud synchronization capability\n- Automatic sync after each transaction
- Data backup and restore functionality
- Role-based data filtering and access control

### 6.2 Hardware Integration\n- Barcode scanner support\n- Thermal receipt printer integration (55mm and 80mm paper sizes)
- Printer functionality in offline mode
- Multi-device compatibility

### 6.3 Receipt Specifications
- Thermal paper support: 55mm and 80mm widths
- Receipt format similar to restaurant/cafe thermal printers
- Print invoice details including items, quantities, prices, total, payment method
- Support for offline printing
- Multi-language receipt printing based on selected language

### 6.4 Security Requirements
- Secure password storage
- Role-based authentication and authorization
- Session management
- Data encryption for sensitive information

### 6.5 Internationalization (i18n)
- Text variable-based language switching mechanism
- Support for English and Arabic languages
- RTL layout support for Arabic\n- Language preference persistence per user\n- All static text content should be externalized for translation
- Date and number formatting based on selected language locale