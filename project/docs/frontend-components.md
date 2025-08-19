# Frontend Components Documentation

## Layout Components

### AuthLayout

Provides the layout for authentication-related pages.

**Location**: `frontend/src/layouts/AuthLayout.jsx`

**Usage**:
```jsx
<AuthLayout>
  <LoginForm />
</AuthLayout>
```

### MainLayout

Provides the layout for authenticated pages, including navigation and header.

**Location**: `frontend/src/layouts/MainLayout.jsx`

**Usage**:
```jsx
<MainLayout>
  <Dashboard />
</MainLayout>
```

## Page Components

### Dashboard

Displays summary statistics, charts, and recent activity.

**Location**: `frontend/src/pages/Dashboard.jsx`

**Features**:
- Summary cards with key metrics
- Daily trend charts
- Operator performance table
- Recent uploads list

### Login

Handles user authentication.

**Location**: `frontend/src/pages/Login.jsx`

**Features**:
- Username and password form
- Authentication error handling
- Remember me functionality

### Proposals

Manages proposal listing, filtering, and editing.

**Location**: `frontend/src/pages/Proposals.jsx`

**Features**:
- Paginated proposal table
- Search and filter functionality
- Proposal detail view
- Edit proposal form

### Validations

Manages validation issues listing and resolution.

**Location**: `frontend/src/pages/Validations.jsx`

**Features**:
- Paginated validations table
- Filter by type and status
- Validation detail view
- Resolution form

### Upload

Handles file uploads and processing.

**Location**: `frontend/src/pages/Upload.jsx`

**Features**:
- File selection and upload
- Spreadsheet type selection
- Upload progress indicator
- Processing results display

### Operators

Manages system users (admin only).

**Location**: `frontend/src/pages/Operators.jsx`

**Features**:
- Operator listing with performance metrics
- Create operator form
- Edit operator details
- Reset password functionality

### Profile

Allows users to manage their own profile.

**Location**: `frontend/src/pages/Profile.jsx`

**Features**:
- Update profile information
- Change password form
- Activity history

### Reports

Generates custom reports.

**Location**: `frontend/src/pages/Reports.jsx`

**Features**:
- Report configuration form
- Filter selection
- Format selection (Excel/PDF)
- Download functionality

### NotFound

Displays a 404 error page.

**Location**: `frontend/src/pages/NotFound.jsx`

## Context Providers

### AuthContext

Manages authentication state throughout the application.

**Location**: `frontend/src/contexts/AuthContext.jsx`

**Provides**:
- Current user information
- Login function
- Logout function
- Authentication status

## Service Components

### API Service

Handles API communication with the backend.

**Location**: `frontend/src/services/api.js`

**Features**:
- Axios instance configuration
- Authentication token management
- API endpoint methods
- Error handling

## Common UI Components

### DataTable

Reusable table component with pagination, sorting, and filtering.

**Props**:
- `data`: Array of items to display
- `columns`: Column configuration
- `pagination`: Pagination settings
- `onPageChange`: Page change handler
- `onSort`: Sort handler

### FilterBar

Reusable filter component for tables.

**Props**:
- `filters`: Available filters
- `activeFilters`: Currently applied filters
- `onFilterChange`: Filter change handler

### StatusBadge

Displays status indicators with appropriate colors.

**Props**:
- `status`: Status value
- `type`: Type of status (proposal, validation, etc.)

### ConfirmDialog

Reusable confirmation dialog.

**Props**:
- `open`: Dialog visibility
- `title`: Dialog title
- `message`: Dialog message
- `onConfirm`: Confirmation handler
- `onCancel`: Cancel handler

### FileUploader

Handles file selection and upload.

**Props**:
- `accept`: Accepted file types
- `maxSize`: Maximum file size
- `onUpload`: Upload handler
- `multiple`: Allow multiple files

## Hooks

### useAuth

Provides access to authentication context.

**Usage**:
```jsx
const { user, login, logout, isAuthenticated } = useAuth();
```

### usePagination

Manages pagination state for tables.

**Usage**:
```jsx
const { page, limit, setPage, setLimit, paginateData } = usePagination(data);
```

### useFilter

Manages filter state for tables.

**Usage**:
```jsx
const { filters, setFilter, clearFilters, filteredData } = useFilter(data);
```

### useApi

Provides API methods with loading and error states.

**Usage**:
```jsx
const { data, loading, error, fetchData } = useApi(apiEndpoint);
```