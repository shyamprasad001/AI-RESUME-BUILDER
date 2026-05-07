# AI Resume Builder

An intelligent, AI-powered resume builder designed to optimize resumes for Applicant Tracking Systems (ATS) while providing a seamless user experience. Built with the MERN stack and integrated with Google's Gemini AI for smart suggestions and content enhancement.

## Features

- **ATS Optimization**: Built-in ATS scoring system that analyzes resume compatibility with job descriptions
- **AI-Powered Content**: Integrated with Gemini AI for intelligent bullet point suggestions, summary generation, and skill gap analysis
- **Resume Templates**: Multiple professional templates optimized for different industries
- **Real-time Preview**: Live PDF preview with instant updates as you edit
- **Version Control**: Track and manage multiple versions of your resume
- **Google OAuth**: Secure authentication with Google accounts
- **Responsive Design**: Modern, mobile-friendly interface built with React and Tailwind CSS
- **PDF Export**: High-quality PDF generation with customizable layouts
- **Chat Interface**: AI chat assistant for resume improvement suggestions
- **Skill Analysis**: Automatic keyword extraction and job matching

## Tech Stack

### Frontend

- **React 19** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React PDF** - PDF generation and rendering
- **React Icons** - Icon library
- **React Hot Toast** - Toast notifications

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Google Auth Library** - OAuth integration
- **Gemini AI** - Google's AI model for content generation
- **LangChain** - Framework for AI applications
- **PDF.js** - PDF parsing and processing
- **Multer** - File upload handling

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Google Cloud Project with Gemini AI API enabled
- Google OAuth credentials

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ai-resume-builder.git
   cd ai-resume-builder
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**

   Create a `.env` file in the `server` directory with the following variables:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ai-resume-builder
   JWT_SECRET=your-jwt-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GEMINI_API_KEY=your-gemini-api-key
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system or update the `MONGODB_URI` to point to your cloud database.

## Usage

1. **Start the backend server**

   ```bash
   cd server
   npm run dev
   ```

   The server will start on `http://localhost:5000`

2. **Start the frontend development server**

   ```bash
   cd client
   npm run dev
   ```

   The client will start on `http://localhost:5173`

3. **Open your browser**
   Navigate to `http://localhost:5173` to start building your resume!

## API Documentation

The API provides endpoints for:

- User authentication (Google OAuth)
- Resume CRUD operations
- Version management
- AI-powered content suggestions
- ATS scoring and analysis

Base URL: `http://localhost:5000/api`

### Authentication Endpoints

- `POST /auth/google` - Google OAuth login
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - Logout

### Resume Endpoints

- `GET /resumes` - Get user's resumes
- `POST /resumes` - Create new resume
- `GET /resumes/:id` - Get specific resume
- `PUT /resumes/:id` - Update resume
- `DELETE /resumes/:id` - Delete resume

### AI Endpoints

- `POST /ai/suggestions` - Get AI suggestions for resume content
- `POST /ai/score` - Calculate ATS score
- `POST /ai/chat` - Chat with AI assistant

## Project Structure

```
ai-resume-builder/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API service functions
│   │   └── constants/     # Application constants
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic services
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

If you find this project helpful, please give it a ⭐️ on GitHub!

For questions or support, please open an issue on the GitHub repository.
