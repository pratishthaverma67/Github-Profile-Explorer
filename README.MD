URL = https://github-profile-explorer-rust.vercel.app/

# GitHub Profile Explorer

A developer analytics dashboard that lets you explore public GitHub profiles, browse repositories, view language statistics and recent activity, and compare two developers.

## Features

- **Profile Search** — Look up a GitHub username and view public profile details.
- **Repository Explorer** — Browse repositories, descriptions, primary languages, stars and forks.
- **Developer Statistics** — View repository count, followers, following, total stars and forks.
- **Language Distribution** — Visualize languages used across repositories.
- **Recent Activity** — View recent public GitHub events.
- **Developer Comparison** — Compare two GitHub users.
- **Error Handling** — Helpful messages for invalid usernames and API errors.

## Tech Stack

**Frontend**
- React
- Vite
- Axios
- Tailwind CSS
- Recharts
- Lucide React

**Backend**
- Python
- FastAPI
- Requests
- GitHub REST API

## Project Structure

```text
Github-Profile-Explorer/
├── Backend/
│   ├── main.py
│   └── requirements.txt
├── Frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.10 or newer
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/pratishthaverma67/Github-Profile-Explorer.git
cd Github-Profile-Explorer
```

### 2. Set up the backend

```bash
cd Backend
python -m venv .venv
```

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
python -m uvicorn main:app --reload
```

Backend URLs:
- API: http://127.0.0.1:8000
- API documentation: http://127.0.0.1:8000/docs

### 3. Set up the frontend

Open a second terminal:

```bash
cd Frontend
npm install
npm run dev
```

Open the local URL shown by Vite, usually http://localhost:5173.

### GitHub API Token (Optional)

Public GitHub data can be accessed without a token, but unauthenticated requests have a lower rate limit.

To use a token:
1. Create a GitHub Personal Access Token.
2. Create a `.env` file inside `Backend`.
3. Add:

```env
GITHUB_TOKEN=your_github_token_here
```

Never commit or share your `.env` file or token.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Backend status |
| GET | `/api/health` | Health check |
| GET | `/api/profile/{username}` | Fetch profile |
| GET | `/api/repos/{username}` | Fetch and sort repositories |
| GET | `/api/stats/{username}` | Developer statistics |
| GET | `/api/activity/{username}` | Recent public activity |
| GET | `/api/compare?user1={username}&user2={username}` | Compare developers |

## Example Usernames

- `torvalds`
- `octocat`

## Notes and Limitations

- Uses publicly available GitHub REST API data.
- Unauthenticated API requests have a limited quota.
- Recent activity is based on the public events returned by GitHub.
- Language distribution uses each repository's primary language, not code-line or byte counts.
- The frontend and backend need to be deployed and connected for public access.

## Future Improvements

- Improve comparison visualizations and responsive layouts.
- Add caching to reduce repeated GitHub API requests.
- Add pagination and more repository filters.

## Author

**Pratishtha Verma**

If you find this project useful, feel free to star the repository!
