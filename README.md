
# Mitigation AI Suite (Server + Client)

This folder contains **one full working project**:

- `server/` → Node/Express + OpenAI backend
- `client/` → React frontend UI

## 1. Running locally

### 1.1 Server

```bash
cd server
npm install
cp .env.example .env   # then edit .env and put your real OPENAI_API_KEY
npm start
```

You should see:

```text
Mitigation AI server running on port 5000
```

### 1.2 Client

Open a second terminal:

```bash
cd client
npm install
cp .env.example .env   # uses http://localhost:5000 by default
npm start
```

Open http://localhost:3000 in your browser.

---

## 2. Deploying backend to Render

- New **Web Service**
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `node index.js`
- Add environment variable: `OPENAI_API_KEY=your_real_key_here`

After deploy you'll have a URL like:

```text
https://mitigation-ai-server.onrender.com
```

Update your **client** `.env` in production to point to that URL.

## 3. Deploying frontend to Render (Static Site)

- New **Static Site**
- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `build`
- Environment variable:

```text
REACT_APP_API_BASE=https://YOUR-BACKEND-URL.onrender.com
```

Then deploy. The static site will call the live backend.
