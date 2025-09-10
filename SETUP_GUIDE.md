# Complete Setup Guide for Running EduConnect Independently

This guide will help you set up and run the EduConnect project on your laptop without any external dependencies.

## Step 1: Install Required Software

### 1.1 Install Node.js
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS version (recommended)
3. Run the installer and follow the setup wizard
4. Verify installation by opening Command Prompt/Terminal and typing:
   ```bash
   node --version
   npm --version
   ```

### 1.2 Install MongoDB (Choose One Option)

#### Option A: MongoDB Community Edition (Local)
1. Go to [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Download MongoDB Community Server for your OS
3. Install following the setup wizard
4. Start MongoDB service:
   - **Windows**: Search "Services" → Find "MongoDB" → Start
   - **macOS**: `brew services start mongodb/brew/mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

#### Option B: MongoDB Atlas (Cloud - Easier)
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Get the connection string (we'll use this later)

### 1.3 Install Git (if not already installed)
1. Go to [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. Download and install Git for your operating system

## Step 2: Prepare Your Project

### 2.1 Copy Project Files
1. Copy the entire project folder to your desired location on your laptop
2. Open Command Prompt/Terminal and navigate to the project folder:
   ```bash
   cd path/to/your/project-edu
   ```

### 2.2 Install Dependencies

1. **Install backend dependencies**:
   ```bash
   npm install
   ```

2. **Install frontend dependencies**:
   ```bash
   cd client
   npm install
   cd ..
   ```

### 2.3 Create Environment File

1. Create a file named `.env` in the root directory (same level as package.json)
2. Add the following content:

```env
# Database Configuration
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/educonnect

# For MongoDB Atlas (replace with your connection string):
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/educonnect

# JWT Secret (use any random string)
JWT_SECRET=your_super_secret_jwt_key_12345

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Important**: If using MongoDB Atlas, replace the MONGO_URI with your actual connection string from Atlas.

## Step 3: Set Up Database

### 3.1 Verify MongoDB Connection

1. If using local MongoDB, ensure the service is running
2. If using MongoDB Atlas, ensure your connection string is correct in `.env`

### 3.2 Seed Database with Sample Data

Run these commands to populate your database with sample data:

```bash
node scripts/seedUniversities.js
node scripts/seedScholarships.js
node populate-resources.js
```

## Step 4: Run the Application

### 4.1 Start Backend Server

1. Open Command Prompt/Terminal in the project root directory
2. Run:
   ```bash
   npm start
   ```
3. You should see: "Server running on port 5000" and "MongoDB connected"

### 4.2 Start Frontend Server

1. Open a **NEW** Command Prompt/Terminal window
2. Navigate to the client folder:
   ```bash
   cd path/to/your/project-edu/client
   ```
3. Run:
   ```bash
   npm start
   ```
4. Your browser should automatically open to `http://localhost:3000`

## Step 5: Test the Application

### 5.1 Create Test Accounts

1. Go to `http://localhost:3000/signup`
2. Create a student account
3. Create an admin account (use role: "admin" during registration)

### 5.2 Test Key Features

1. **Student Features**:
   - Login with student account
   - Browse universities
   - Submit an application
   - Check scholarships
   - View resources

2. **Admin Features**:
   - Login with admin account
   - View admin dashboard
   - Manage applications
   - Add universities

## Step 6: Prepare for Demonstration

### 6.1 Create Demo Data

1. Create a few test student accounts
2. Submit some applications
3. Add some universities (as admin)
4. This will make your demo more impressive

### 6.2 Practice Your Demo

1. Start both servers (backend and frontend)
2. Practice the user flow:
   - Registration → Login → Browse → Apply → Track
3. Practice admin features:
   - Login as admin → Manage applications → Add content

## Step 7: Troubleshooting

### Common Issues and Solutions

1. **"Port 3000 is already in use"**
   - Close any other applications using port 3000
   - Or change the port in client/package.json

2. **"MongoDB connection failed"**
   - Ensure MongoDB service is running (local)
   - Check connection string (Atlas)
   - Verify network connectivity

3. **"Module not found" errors**
   - Delete `node_modules` folders
   - Run `npm install` again in both root and client directories

4. **Frontend not loading**
   - Check if backend is running on port 5000
   - Verify no firewall blocking the ports
   - Try accessing `http://localhost:5000` directly

### Quick Reset Commands

If something goes wrong, use these commands to reset:

```bash
# Stop all running servers (Ctrl+C in terminals)

# Clean and reinstall dependencies
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

cd client
rm -rf node_modules package-lock.json
npm install
cd ..

# Restart servers
npm start
# (in new terminal) cd client && npm start
```

## Step 8: Demo Day Checklist

### Before Your Presentation

- [ ] MongoDB is running
- [ ] Backend server is running (npm start)
- [ ] Frontend server is running (cd client && npm start)
- [ ] Test login with both student and admin accounts
- [ ] Verify all major features work
- [ ] Have sample data ready
- [ ] Close unnecessary applications to free up system resources

### During Presentation

1. **Start with Homepage**: Show the clean, professional interface
2. **Student Journey**: Register → Login → Browse → Apply
3. **Admin Features**: Show management capabilities
4. **Highlight Features**: Real-time updates, file uploads, responsive design

### Backup Plan

If live demo fails:
- Take screenshots of key features beforehand
- Record a short video of the application working
- Prepare to show the code structure and explain the architecture

## Additional Tips

1. **Performance**: Close other applications to ensure smooth running
2. **Internet**: Some features might need internet (if using MongoDB Atlas)
3. **Backup**: Keep a backup copy of the working project
4. **Practice**: Run through the demo multiple times before presentation

Good luck with your presentation! Your teacher will be impressed with this comprehensive university application management system.