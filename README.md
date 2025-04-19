# PDF Toolkit Backend

Backend API server for PDF Toolkit - a suite of PDF conversion tools.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- pandoc (for document conversions)
- ImageMagick (for image conversions)

## Project Structure

```
pdf-toolkit-backend/
├── controllers/           # API controllers
│   ├── convert.controllers.js
│   ├── upload.controllers.js
│   └── user.controllers.js
├── db/                    # Database connection
│   └── index.js
├── middlewares/           # Express middlewares
│   └── upload.middlewares.js
├── routes/                # API routes
│   └── user.routes.js
├── convertedFile/         # Directory for storing converted files
├── uploadFile/            # Directory for storing uploaded files
├── index.js               # Main server file
├── package.json           # Project dependencies
└── .env                   # Environment variables
```

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Install required system tools:
   - For document conversions: `sudo apt-get install pandoc`
   - For image conversions: `sudo apt-get install imagemagick`

3. Create `.env` file based on the provided example.

## Running the Server

Development mode with auto-restart:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

- **GET /api/health** - Health check endpoint
- **GET /api/v1/user/login** - User login (placeholder)
- **GET /api/v1/user/profile** - Get user profile (placeholder)
- **POST /api/v1/user/upload** - Upload and convert files
- **GET /api/v1/user/download** - Download converted files

## Deployment

This backend can be deployed to any Node.js hosting service like:
- Render
- Railway
- Heroku
- AWS Elastic Beanstalk

Make sure to set the appropriate environment variables in your hosting platform.