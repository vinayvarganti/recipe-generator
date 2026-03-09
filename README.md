# Generative Recipe Creator with Ingredient Constraints using Cognitive AI

A complete AI-powered web application that generates original recipes based on available ingredients and user constraints using cognitive AI principles.

## Features

### Core Functionality
- User authentication (register, login, logout)
- Ingredient input and management
- Multi-constraint recipe generation
- Recipe rating and feedback system
- User profile with recipe history

### AI & Cognitive Intelligence
- Ingredient compatibility reasoning
- Constraint-based decision making
- Contextual cuisine understanding
- Natural language recipe generation
- Constraint validation engine
- Learning from user feedback

### Admin Features
- Ingredient knowledge base management
- Nutritional data updates
- User activity monitoring
- Recipe generation rule improvements

## Technology Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **AI Engine**: Custom cognitive reasoning engine
- **Authentication**: JWT tokens
- **API**: RESTful services

## Quick Start

1. Install dependencies:
```bash
npm install
cd client && npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the application:
```bash
npm run dev
```

4. Access the application at `http://localhost:3000`

## Project Structure

```
generative-recipe-creator/
├── server/                 # Backend application
├── client/                 # Frontend React application
├── ai-engine/             # Cognitive AI reasoning engine
├── database/              # Database schemas and seeds
├── docs/                  # API documentation
└── deployment/            # Deployment configurations
```

## API Documentation

See `/docs/api.md` for complete API documentation.

## Deployment

See `/deployment/README.md` for deployment instructions.