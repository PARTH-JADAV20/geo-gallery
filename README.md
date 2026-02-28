# 📌 GeoTag Photo Logger

A complete production-ready full-stack mobile application for capturing and organizing photos with geotagging capabilities.

## 🚀 Features

### Authentication System
- ✅ User registration with validation
- ✅ Secure login with JWT tokens
- ✅ **Persistent authentication** - Stay logged in across app restarts
- ✅ **Biometric Authentication** - Fingerprint, Face ID, and device lock support
- ✅ **Full-screen security overlay** - Blocks app access during biometric auth
- ✅ Auto-redirect based on auth state
- ✅ **Settings screen** - Manage biometric preferences

### Core Features
- ✅ Capture photos with device camera
- ✅ **Advanced camera controls** - Flash toggle, front/back camera switch
- ✅ Automatic GPS location tagging
- ✅ **Location name resolution** - Shows readable addresses instead of coordinates
- ✅ Beautiful glassmorphism UI design
- ✅ **Status bar optimization** - Proper spacing for notches and camera cutouts
- ✅ Pull-to-refresh functionality
- ✅ Entry management (Create, Read, Delete)
- ✅ **Full-screen image viewer** - Tap images to view in detail
- ✅ Real-time data synchronization

### Bonus Features
- ✅ **Interactive MapView with photo markers** - See all your photos on a map
- ✅ **Photo location pins** - Circular photo markers showing exact photo locations
- ✅ **Location name resolution** - Shows landmark names like "Saroda Rai University, Ahmedabad"
- ✅ **Tap-to-view photo details** - Full-screen photo overlay with location info
- ✅ **Real-time geocoding** - Converts GPS coordinates to readable addresses
- ✅ **Consistent location display** - Map and home page show same location format
- ✅ Delete entries with confirmation
- ✅ Empty state UI components
- ✅ Responsive design for all screen sizes
- ✅ **Tab navigation** - Home, Create, Map, Settings
- ✅ **User profile display** - Shows user info in settings
- ✅ **App information** - Version and about details

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
```
backend/
├── controllers/          # Route controllers
├── models/              # Mongoose schemas
├── routes/              # API routes
├── middleware/          # Custom middleware
├── uploads/             # Image storage
├── server.js            # Main server file
└── package.json         # Dependencies
```

### Frontend (React Native + Expo)
```
frontend/
├── app/
│   ├── (auth)/         # Authentication screens
│   ├── (tabs)/         # Main app screens
│   ├── components/      # Reusable components
│   ├── context/         # React Context
│   ├── services/        # API services
│   └── utils/          # Helper functions
├── assets/             # Static assets
└── package.json        # Dependencies
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin requests

### Frontend
- **Expo SDK 54** - Development platform
- **React Native** - Mobile framework
- **Expo Router** - Navigation
- **Expo Camera** - Camera access
- **Expo Location** - GPS services
- **Expo SecureStore** - Secure storage
- **Expo Local Authentication** - Biometric authentication
- **React Native Reanimated** - Animations
- **React Native Gesture Handler** - Gestures
- **Expo Linear Gradient** - Gradients
- **React Native Maps** - Map functionality
- **Axios** - HTTP client
- **Ionicons** - Icon library

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Expo CLI
- Android Studio / Xcode (for device testing)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Configure .env file**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/geotag-photo-logger

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Backend URL
BACKEND_URL=http://localhost:5000
```

5. **Start the backend server**
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Run on device/simulator**
```bash
# For Android
npm run android

# For iOS (macOS only)
npm run ios

# For web
npm run web
```

## 🔧 Configuration

### MongoDB Setup

#### Option 1: Local MongoDB
```bash
# Start MongoDB service
mongod

# Create database (will be created automatically on first use)
use geotag-photo-logger
```

#### Option 2: MongoDB Atlas
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster-url/geotag-photo-logger?retryWrites=true&w=majority
```

### API Configuration

Update the API URL in `frontend/app/services/authService.js` if your backend runs on a different host:
```javascript
const API_URL = 'http://YOUR_BACKEND_IP:5000/api';
```

For mobile testing, use your computer's IP address:
```javascript
const API_URL = 'http://192.168.1.100:5000/api'; // Replace with your IP
```

## 📱 App Usage

### First Time Setup
1. Open the app
2. Create a new account
3. Grant camera and location permissions
4. **Enable biometric authentication** (optional but recommended)
5. Start capturing photos!

### Main Features
- **Home Tab**: View all your geotagged photos with location names
- **Create Tab**: Capture new photos with advanced camera controls
- **Map Tab**: View all photos on an interactive map
- **Settings Tab**: Manage biometric authentication and app preferences

### Camera Features
- **Flash control** - Toggle flash on/off
- **Camera switch** - Front and back camera
- **Auto-focus** - Automatic focus adjustment
- **Real-time preview** - Live camera feed
- **Location tagging** - Automatic GPS location capture
- **Location names** - Shows readable addresses instead of coordinates
- **Image validation** - Ensures photo quality

### Biometric Authentication
- **Setup** - Enable fingerprint, Face ID, or device lock
- **Auto-lock** - App prompts for biometric on startup
- **Security overlay** - Full-screen protection during authentication
- **Fallback options** - PIN/Pattern if biometric fails
- **Toggle control** - Enable/disable in settings

### Image Viewing
- **Full-screen viewer** - Tap any image to view in detail
- **Entry details** - Shows title, description, location, and date
- **Delete functionality** - Remove unwanted entries
- **Location display** - Human-readable location names

### Map Features
- **Interactive markers** - Photo locations on map with circular photo pins
- **Photo markers** - Your photos displayed as circular markers on the map
- **Location names** - Shows landmark names like "Saroda Rai University, Ahmedabad"
- **Tap-to-view** - Tap markers to see full photo with location details
- **Real-time geocoding** - Converts GPS coordinates to readable addresses
- **Consistent display** - Same location format as home page
- **Zoom controls** - Pan and zoom to explore photo locations
- **User location** - Shows your current position on map
- **Photo overlay** - Full-screen photo view with location information
- **Exact coordinates** - Precise GPS location for each photo
- **Zoom and pan** - Explore the map freely

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- **Persistent login sessions** - Stay logged in across app restarts
- **Biometric authentication** - Fingerprint, Face ID, and device lock support
- **Full-screen security overlay** - Blocks app access during biometric auth
- **Secure token storage** - Expo SecureStore for sensitive data
- **Auto-logout on auth failure** - Security-first approach
- Input validation and sanitization
- File upload restrictions
- CORS protection
- Rate limiting ready

## 🧪 Testing

### Backend Testing
```bash
# Test API endpoints
curl http://localhost:5000/health

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Frontend Testing
- Use Expo Go app for quick testing
- Test on physical devices for camera/location features
- Test on different screen sizes

## 🚀 Deployment

### Backend Deployment

#### Option 1: Vercel
1. Install Vercel CLI
2. Run `vercel` in backend directory
3. Configure environment variables

#### Option 2: Railway/Render
1. Connect your GitHub repository
2. Configure build settings
3. Set environment variables

### Frontend Deployment

#### Option 1: Expo EAS
```bash
npm install -g eas-cli
eas build
eas submit
```

#### Option 2: Web Deployment
```bash
npm run web
# Deploy the dist/ folder to your hosting provider
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Entries
- `POST /api/entries` - Create new entry (with image)
- `GET /api/entries` - Get user entries
- `GET /api/entries/:id` - Get single entry
- `PUT /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry

## 🎨 Customization

### Colors & Theme
Edit `frontend/app/utils/constants.js`:
```javascript
export const COLORS = {
  PRIMARY_GRADIENT: ['#6C63FF', '#4D9FFF'],
  ACCENT_GRADIENT: ['#FF6FD8', '#3813C2'],
  // ... other colors
};
```

### API Configuration
Edit `frontend/app/services/authService.js` for different API endpoints.

### Map Styling
Customize map appearance in `frontend/app/(tabs)/map.js`.

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
- **MongoDB Connection**: Ensure MongoDB is running
- **Port Conflicts**: Change PORT in .env if needed
- **CORS Issues**: Check frontend API URL

#### Frontend Issues
- **Metro Bundler**: Clear cache with `npx expo start -c`
- **Permissions**: Ensure camera/location permissions are granted
- **Network**: Check API connectivity

#### Camera Issues
- **Simulator**: Use physical device for camera testing
- **Permissions**: Grant camera permissions in device settings
- **Storage**: Ensure sufficient device storage

#### Location Issues
- **GPS**: Enable location services
- **Permissions**: Grant location permissions
- **Accuracy**: Wait for GPS to get accurate reading

### Debug Commands
```bash
# Clear Expo cache
npx expo start -c

# Reset project
npx expo install --fix

# Check dependencies
npx expo doctor

# Backend logs
npm run dev
```

## 📝 Development Notes

### Code Structure
- Functional components with hooks only
- Context API for state management
- Service layer for API calls
- Constants for configuration
- Helper functions for utilities

### Best Practices
- Input validation on both client and server
- Error handling with user-friendly messages
- Loading states for better UX
- Responsive design for all devices
- Secure storage for sensitive data

### Performance
- Image optimization and compression
- Efficient data fetching with pagination
- Debounced search and filters
- Optimized re-renders with React.memo

## 🆕 Recent Updates & Improvements

### Version 1.1.0 - Enhanced Security & UX
- ✅ **Biometric Authentication** - Added fingerprint, Face ID, and device lock support
- ✅ **Full-Screen Security Overlay** - Professional security interface during authentication
- ✅ **Persistent Login** - Users stay logged in across app restarts until manual logout
- ✅ **Advanced Camera Controls** - Flash toggle and front/back camera switching
- ✅ **Location Name Resolution** - Shows readable addresses instead of coordinates
- ✅ **Full-Screen Image Viewer** - Tap images to view in detail with delete functionality
- ✅ **Settings Screen** - Manage biometric preferences and view app information
- ✅ **Status Bar Optimization** - Proper spacing for notches and camera cutouts
- ✅ **Enhanced Tab Navigation** - Added Settings tab with user profile display
- ✅ **Improved Error Handling** - Better network error management and user feedback

### Technical Improvements
- **Biometric State Management** - Proper state synchronization between components
- **Enhanced Authentication Flow** - Improved token management and error handling
- **UI/UX Enhancements** - Better visual feedback and loading states
- **Performance Optimizations** - Reduced unnecessary re-renders and improved data flow
- **Code Architecture** - Better separation of concerns and modular design

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using React Native & Node.js**
