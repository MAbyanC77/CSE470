# EduConnect - University Application Management System

A comprehensive web application for managing university applications, scholarships, and educational resources. Built with React.js frontend and Node.js/Express backend with MongoDB database.

## Features

### For Students
- **User Authentication**: Secure registration and login system
- **University Search**: Browse and search universities with detailed information
- **Application Management**: Apply to universities and track application status
- **Scholarship Discovery**: Find and apply for scholarships
- **Resource Library**: Access educational materials and test preparation resources
- **Deadline Tracking**: Keep track of important application deadlines
- **Profile Management**: Manage personal information and documents
- **Budget Planning**: Track application costs and financial planning

### For Administrators
- **Application Review**: Manage and update application statuses
- **University Management**: Add and update university information
- **Scholarship Management**: Manage scholarship programs
- **User Management**: Oversee user accounts and permissions
- **Resource Management**: Add and organize educational resources

## Technology Stack

- **Frontend**: React.js, React Router, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer for document handling
- **Notifications**: React Toastify

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **Git** - [Download here](https://git-scm.com/downloads)

## Installation and Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd project-edu
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/educonnect
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/educonnect

# JWT Secret (use a strong, random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 5. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   - **Windows**: Start MongoDB service from Services or run `mongod`
   - **macOS**: `brew services start mongodb/brew/mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGO_URI` in `.env`

### 6. Seed the Database (Optional)
Populate the database with sample data:
```bash
node scripts/seedUniversities.js
node scripts/seedScholarships.js
node populate-resources.js
```

## Running the Application

### Development Mode

1. **Start the Backend Server**:
```bash
npm start
```
The backend will run on `http://localhost:5000`

2. **Start the Frontend Development Server** (in a new terminal):
```bash
cd client
npm start
```
The frontend will run on `http://localhost:3000`

### Production Mode

1. **Build the Frontend**:
```bash
cd client
npm run build
cd ..
```

2. **Start the Production Server**:
```bash
NODE_ENV=production npm start
```

## Usage Guide

### For Students
1. **Register**: Create a new account with your email
2. **Complete Profile**: Add your personal information and academic details
3. **Browse Universities**: Search and explore university options
4. **Apply**: Submit applications with required documents
5. **Track Progress**: Monitor application status and deadlines
6. **Explore Resources**: Access study materials and test prep resources

### For Administrators
1. **Login**: Use admin credentials to access admin dashboard
2. **Manage Applications**: Review and update application statuses
3. **Add Universities**: Create new university profiles
4. **Manage Resources**: Upload and organize educational content

## Project Structure

```
project-edu/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context for state management
│   │   └── App.js         # Main app component
│   └── package.json
├── models/                # MongoDB schemas
├── routes/                # Express API routes
├── middleware/            # Custom middleware
├── scripts/               # Database seeding scripts
├── uploads/               # File upload directory
├── server.js              # Express server entry point
├── package.json           # Backend dependencies
└── .env                   # Environment variables
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user

### Universities
- `GET /api/universities` - Get all universities
- `GET /api/universities/:id` - Get university by ID
- `POST /api/universities` - Create university (admin)

### Applications
- `POST /api/applications` - Submit application
- `GET /api/applications/user/:userId` - Get user applications
- `PUT /api/applications/:id/status` - Update application status (admin)

### Scholarships
- `GET /api/scholarships` - Get all scholarships
- `POST /api/scholarships/apply` - Apply for scholarship

### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources/category/:category` - Get resources by category

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access for MongoDB Atlas

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes: `npx kill-port 5000`

3. **Module Not Found Errors**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

4. **Frontend Build Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete `client/node_modules` and reinstall

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure environment variables are set correctly
4. Check that MongoDB is running and accessible

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact [your-email@example.com]