# ITF of India Backend

Professional Node.js + Express backend for the ITF of India athlete registration system.

## Technologies
- **Node.js & Express**: Core backend framework.
- **Firebase Firestore**: Database for storing registration data.
- **Cloudinary**: Cloud storage for images (Passport Photo, Signature, Aadhar, Payment Proof) and PDFs.
- **Multer**: Middleware for handling multi-part form data (file uploads).
- **Dotenv**: Environment variable management.

## Project Structure
```
backend/
├── config/             # Configuration for Firebase and Cloudinary
├── controllers/        # Request handling logic
├── middleware/         # Custom middleware (Multer, Error Handler)
├── routes/             # API route definitions
├── services/           # External service abstractions (Firebase, Cloudinary)
├── utils/              # Helper functions and response handlers
├── .env.example        # Environment variables template
├── app.js              # Express app configuration
└── server.js           # Server entry point
```

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`.
   - Fill in your Firebase and Cloudinary credentials.
   - For `FIREBASE_SERVICE_ACCOUNT_JSON`, provide the stringified JSON from your Firebase Service Account key file.

3. **Run the Server**:
   - Development mode (with nodemon):
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm start
     ```

## API Endpoints

### Registrations
- `POST /api/registrations/register`: Register a new athlete (requires multi-part form data with files).
- `GET /api/registrations`: Get all registrations.
- `GET /api/registrations/:id`: Get registration details by ID.

### Health Check
- `GET /health`: Check if the server is running.
