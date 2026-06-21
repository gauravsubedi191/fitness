# AestheticFit Gym Companion 🏋️‍♂️

A premium, custom-styled personal fitness tracker designed specifically for beginners, enabling total progress tracking with 60+ exercises, streaks calendars, weekly training splits, and secure Firebase synchronization—all entirely free.

## Folder Structure

```
├── .env.example            # Environment variables placeholder definitions
├── .firebaserc             # Firebase target project mapping config
├── firestore.rules         # Hardened zero-trust security rule policies
├── firebase.json           # Hosting configuration schema
├── index.html              # Core application HTML document
├── package.json            # NPM dependencies lists
├── public/
│   └── manifest.json       # PWA installer specifications
└── src/
    ├── App.tsx             # Main container shell and router state
    ├── main.tsx            # Main application boot loader
    ├── index.css           # Global custom styled themes
    ├── firebase.ts         # Secure dual-mode client initializer
    ├── types.ts            # Global schema configurations & 60+ presets
    ├── context/
    │   └── WorkoutContext.tsx  # Master state machine & Local storage cache
    └── components/
        ├── AuthScreen.tsx       # Secured custom signup splash screen
        ├── BottomNavigation.tsx # Anchored smart navigation bar controls
        ├── HomeView.tsx         # Dashboard displaying volume stats and plans
        ├── LogView.tsx          # Real-time workout sets logger & rest timers
        ├── ExercisesView.tsx    # Compact exercise books with custom creators
        ├── ProgressView.tsx     # One-Rep max charts & body weight logs
        └── ProfileView.tsx      # Training split editors & weekly planners
```

---

## Step-by-Step Installation for Beginners

### 1. Run the local development server
Run these commands in your workspace root directory:
```bash
# 1. Install dependencies
npm install

# 2. Boot the app locally
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view and interact with the app.

---

## Deploy to Firebase (Free Hosting & Sync)

AestheticFit works in **Local Preview Mode** by default. To hook up your real Firebase project and deploy it for free:

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it (e.g., `aesthetic-fit`).
3. Turn Google Analytics on or off (your choice), then click **Create Project**.

### Step 2: Enable Services
1. **Authentication**: Go to Build > Authentication, click **Get Started**, choose **Google** as a Sign-In provider, and click **Enable**.
2. **Cloud Firestore**: Go to Build > Firestore Database, click **Create Database**, select **Start in production mode**, select a region close to your location, and click **Create**.

### Step 3: Get Your Configuration Secrets
1. In the Firebase project overview, click the **Web icon (`</>`)** to register an app.
2. Name it, click **Register App**, and copy the `firebaseConfig` keys from the screen.
3. Create a `.env` file in your root folder and paste your keys:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```

### Step 4: Deploy Using Firebase CLI
1. Install globally if you don't have it:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and initialize:
   ```bash
   firebase login
   firebase use --add your-project-id
   ```
3. Deploy everything:
   ```bash
   # Build static site chunks
   npm run build

   # Deploy database safety rules and static web files
   firebase deploy
   ```
Your app will be live at `https://your-project-id.web.app` on any desktop, Android, or iOS home screen!
