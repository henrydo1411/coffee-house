# Coffee House Frontend

React Create React App, React Router, Context API, Axios và Bootstrap. Hướng dẫn đầy đủ nằm tại `../README.md`.

```powershell
npm ci
Copy-Item .env.example .env
npm start
```

Backend phải chạy trước ở `http://localhost:5000/api`. Không cần JSON Server. Sau khi đổi `REACT_APP_API_URL`, khởi động lại frontend.

```powershell
npm test -- --watchAll=false --runInBand
npm run build
```
