# 🚀 Quick Start Guide

Get GeoTag Photo Logger running in 5 minutes!

## 📋 Prerequisites
- Node.js 16+ installed
- MongoDB running locally or Atlas account
- Expo CLI installed (`npm install -g @expo/cli`)
- Physical device for camera testing (recommended)

## ⚡ Quick Setup

### 1. Backend Setup (2 minutes)
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start MongoDB (if using local)
mongod

# Start backend server
npm run dev
```

Backend is now running on `http://localhost:5000`

### 2. Frontend Setup (2 minutes)
```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start Expo
npm start
```

### 3. Run on Device (1 minute)
```bash
# Install Expo Go app on your phone
# Scan QR code from terminal
# OR

# For Android
npm run android

# For iOS (macOS only)
npm run ios
```

## 🎯 Test the App

1. **Create Account**: Register with email and password
2. **Grant Permissions**: Allow camera and location access
3. **Take Photo**: Capture your first geotagged photo
4. **View on Map**: See your photo on the interactive map

## 🔧 Common Issues & Solutions

### ❌ "Network request failed"
**Solution**: Update API URL in `frontend/app/services/authService.js`
```javascript
const API_URL = 'http://YOUR_COMPUTER_IP:5000/api';
```

### ❌ "Camera permission denied"
**Solution**: 
- Android: Settings → Apps → GeoTag → Permissions → Camera
- iOS: Settings → Privacy → Camera → GeoTag

### ❌ "Location permission denied"
**Solution**:
- Android: Settings → Apps → GeoTag → Permissions → Location
- iOS: Settings → Privacy → Location Services → GeoTag

### ❌ "MongoDB connection failed"
**Solution**: Ensure MongoDB is running
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# Start MongoDB if not running
mongod
```

## 📱 Testing Features

### ✅ Authentication
- Register new user
- Login with credentials
- Auto-logout functionality

### ✅ Photo Capture
- Take photos with camera
- Automatic location tagging
- Image preview

### ✅ Entry Management
- View all photos on home screen
- Delete photos with confirmation
- Pull-to-refresh functionality

### ✅ Map View
- Interactive map with photo markers
- Tap markers to see photo details
- Navigate to photo locations

## 🎨 UI Features to Try

### Glassmorphism Design
- Frosted glass cards
- Gradient backgrounds
- Blur effects
- Smooth animations

### Interactive Elements
- Floating action button
- Swipe gestures
- Pull-to-refresh
- Modal dialogs

## 🔍 Debug Tips

### Check Backend Health
```bash
curl http://localhost:5000/health
```

### Check Frontend Logs
- Expo terminal shows real-time logs
- Use device console for detailed errors
- Check Network tab in DevTools (web)

### Reset Everything
```bash
# Clear Expo cache
npx expo start -c

# Reset backend
rm -rf node_modules package-lock.json
npm install

# Reset frontend
rm -rf node_modules package-lock.json
npm install
```

## 📞 Need Help?

1. **Check README.md** for detailed documentation
2. **Review error messages** in terminal/console
3. **Verify environment setup** matches requirements
4. **Test on physical device** for camera/location features

## 🎉 You're Ready!

Your GeoTag Photo Logger is now running! Start capturing and organizing your photos with location tags.

**Next Steps**:
- Customize the theme colors
- Add more features
- Deploy to production
- Share with friends!

---

**Happy Coding! 📸🗺️**
