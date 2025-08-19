# Card Operations Insights & Validation System

A comprehensive web application for validating and analyzing card operations data through Excel/CSV uploads, with real-time validation, dashboards, and reporting capabilities.

## 🚀 Features

- **Excel/CSV Upload**: Support for bulk data uploads with validation
- **Real-time Validation**: Instant feedback on data quality and compliance
- **Interactive Dashboards**: Visual analytics with charts and KPIs
- **Advanced Filtering**: Multi-criteria search and filtering capabilities
- **Export Reports**: Generate and download validation reports
- **User Authentication**: Secure login system with JWT tokens
- **Real-time Notifications**: WebSocket-based notifications for validation results
- **Admin Panel**: Configuration management for validation rules

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Material-UI (MUI)** for components
- **React Query** for state management
- **Chart.js** for data visualization
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **Sequelize ORM**
- **JWT Authentication**
- **Winston** for logging
- **Multer** for file uploads

### DevOps
- **Docker** containerization
- **Docker Compose** for local development
- **Multi-stage builds** for optimization

## 🏃‍♂️ Quick Start

### Prerequisites

- **Node.js** 18+ installed
- **Docker** and **Docker Compose** installed
- **PostgreSQL** (or use Docker for database)

### Option 1: Local Development

#### 1. Clone the repository
```bash
git clone <your-repo-url>
cd card-operations-insights
```

#### 2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 3. Set up environment variables

Create `.env` files in both backend and frontend directories:

**Backend (.env)**
```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=card_operations
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

#### 4. Set up database
```bash
cd backend
npm run dev
# In another terminal, run migrations
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

#### 5. Start the applications
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Option 2: Docker Development

#### 1. Build and run with Docker Compose
```bash
docker-compose up --build
```

#### 2. Access the application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432

### Option 3: Docker Production Build

#### 1. Build individual containers
```bash
# Build frontend
cd frontend
docker build -t card-operations-frontend .

# Build backend
cd ../backend
docker build -t card-operations-backend .
```

#### 2. Run containers
```bash
# Run frontend
docker run -p 3000:3000 card-operations-frontend

# Run backend
docker run -p 3001:3001 --env-file .env card-operations-backend
```

## 🚀 Deployment Options

### Deploy to Render (Recommended)

#### 1. Prepare for Render
- Create accounts on [Render](https://render.com)
- Connect your GitHub repository

#### 2. Backend Deployment
- **Service Type**: Web Service
- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**: Add all variables from `.env`

#### 3. Frontend Deployment
- **Service Type**: Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**: Add frontend variables

#### 4. Database
- **Service Type**: PostgreSQL
- **Plan**: Free tier (100MB storage)
- Update database connection string in environment variables

### Deploy to Railway

#### 1. Prepare for Railway
- Install Railway CLI: `npm install -g @railway/cli`
- Login: `railway login`

#### 2. Deploy backend
```bash
cd backend
railway login
railway init
railway add --service
railway deploy
```

#### 3. Deploy frontend
```bash
cd frontend
railway init
railway add --service
railway deploy
```

### Deploy to Vercel (Frontend Only)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy
```bash
cd frontend
vercel --prod
```

## 📁 Project Structure

```
card-operations-insights/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Utility functions
│   ├── tests/              # Test files
│   ├── Dockerfile          # Production Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   ├── Dockerfile          # Production Dockerfile
│   └── vite.config.js
├── database/
│   ├── migrations/         # Database migrations
│   └── seeds/             # Seed data
├── docker-compose.yml     # Local development setup
├── docker-compose.prod.yml # Production setup
└── README.md
```

## 🔧 Environment Variables

### Backend Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `card_operations` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing key | - |
| `NODE_ENV` | Environment | `development` |

### Frontend Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:3001` |

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 Database Setup

### Using Docker (Recommended)
The database is automatically set up with Docker Compose.

### Manual Setup
1. Install PostgreSQL
2. Create database: `createdb card_operations`
3. Run migrations: `npx sequelize-cli db:migrate`
4. Seed data: `npx sequelize-cli db:seed:all`

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

#### 2. Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

#### 3. Docker Issues
```bash
# Clean Docker cache
docker system prune -a
# Rebuild containers
docker-compose up --build --force-recreate
```

#### 4. Frontend Not Loading
- Check if backend is running on port 3001
- Verify `VITE_API_URL` in frontend `.env`
- Check browser console for CORS errors

## 🔄 CI/CD Pipeline

### GitHub Actions (Basic Setup)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review logs: `docker-compose logs`
3. Open an issue on GitHub

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for scalability and maintainability
- Optimized for free-tier cloud deployments