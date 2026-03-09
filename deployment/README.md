# Deployment Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/recipe_generator

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=7d

# Client Configuration
CLIENT_URL=http://localhost:3000
```

### 3. Database Setup

Start MongoDB service and seed the database:

```bash
# Start MongoDB (varies by OS)
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Seed the database with sample data
npm run seed
```

### 4. Start the Application

```bash
# Start both server and client in development mode
npm run dev

# Or start them separately:
# Terminal 1 - Start server
npm run server

# Terminal 2 - Start client
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Production Deployment

### Option 1: Traditional Server Deployment

#### 1. Server Setup

```bash
# Install dependencies
npm install --production

# Build client
cd client
npm install
npm run build
cd ..

# Set environment variables
export NODE_ENV=production
export MONGODB_URI=your_production_mongodb_uri
export JWT_SECRET=your_production_jwt_secret
```

#### 2. Process Management with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server/index.js --name "recipe-generator"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 3. Nginx Configuration

Create `/etc/nginx/sites-available/recipe-generator`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve static files
    location / {
        root /path/to/your/app/client/build;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/recipe-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# Root Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/recipe_generator
      - JWT_SECRET=your_jwt_secret_here
    depends_on:
      - mongo
    volumes:
      - ./uploads:/app/uploads

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=recipe_generator

volumes:
  mongo_data:
```

#### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: Cloud Platform Deployment

#### Heroku Deployment

1. **Prepare for Heroku:**

```bash
# Install Heroku CLI
# Create Procfile
echo "web: node server/index.js" > Procfile

# Create heroku-postbuild script in package.json
```

Update package.json:
```json
{
  "scripts": {
    "heroku-postbuild": "cd client && npm install && npm run build"
  }
}
```

2. **Deploy to Heroku:**

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set MONGODB_URI=your_mongodb_atlas_uri

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Open app
heroku open
```

#### AWS/DigitalOcean/Other Cloud Providers

1. **Set up MongoDB Atlas** (recommended for cloud deployment)
2. **Configure environment variables** on your cloud platform
3. **Set up CI/CD pipeline** for automated deployments
4. **Configure load balancing** and SSL certificates

## Database Migration

For production deployments, you may need to run migrations:

```bash
# Run database seeding
node database/seed.js

# Or create a migration script
node database/migrate.js
```

## Monitoring and Maintenance

### Health Checks

The application includes a health check endpoint:
```
GET /api/health
```

### Logging

Configure logging for production:

```javascript
// In server/index.js
if (process.env.NODE_ENV === 'production') {
  // Configure production logging
  app.use(morgan('combined'));
}
```

### Backup Strategy

Set up regular MongoDB backups:

```bash
# Create backup script
mongodump --uri="your_mongodb_uri" --out=/path/to/backup/$(date +%Y%m%d)
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use a strong, random JWT secret
3. **Database Security**: Use MongoDB authentication and SSL
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Configure appropriate rate limits
6. **Input Validation**: Ensure all inputs are validated
7. **CORS**: Configure CORS for your domain only

## Performance Optimization

1. **Database Indexing**: Ensure proper MongoDB indexes
2. **Caching**: Implement Redis caching for frequently accessed data
3. **CDN**: Use a CDN for static assets
4. **Compression**: Enable gzip compression
5. **Monitoring**: Set up application monitoring (New Relic, DataDog, etc.)

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**:
   - Check MongoDB service status
   - Verify connection string
   - Check network connectivity

2. **Build Failures**:
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

3. **Authentication Issues**:
   - Verify JWT secret configuration
   - Check token expiration settings
   - Ensure proper CORS configuration

### Logs

Check application logs:
```bash
# PM2 logs
pm2 logs recipe-generator

# Docker logs
docker-compose logs app

# System logs
tail -f /var/log/nginx/error.log
```

## Support

For deployment issues:
1. Check the logs first
2. Verify environment configuration
3. Test database connectivity
4. Check network and firewall settings