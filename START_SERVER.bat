@echo off
echo Starting TokenVote Development Server...
echo.
cd /d "c:\Users\merve\OneDrive\Desktop\TokenVote\frontend"
echo Installing dependencies...
npm install
echo.
echo Starting development server...
npm run dev
echo.
echo The app should now be running at http://localhost:3000
echo Press Ctrl+C to stop the server
pause
