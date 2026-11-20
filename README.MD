GitHub Profile Explorer
A developer analytics dashboard that lets you explore public GitHub profiles, browse repositories, view language statistics and recent activity, and compare two developers.
Features
- Profile Search — Look up a GitHub username and view their public profile details.
- Repository Explorer — Browse public repositories, descriptions, primary languages, stars and forks.
- Developer Statistics — View repository count, followers, following, total stars and forks.
- Language Distribution — Visualize the languages used across a developer's repositories.
- Recent Activity — View recent public GitHub events.
- Developer Comparison — Compare two GitHub users using their profile and repository statistics.
- Error Handling — Displays helpful messages for invalid usernames and API errors.
Tech Stack
Frontend
- React
- Vite
- Axios
- Tailwind CSS
- Recharts
- Lucide React
Backend
- Python
- FastAPI
- Requests
- GitHub REST API
Project Structure
Github Profile Explorer/
├── Backend/
│   ├── main.py
│   └── requirements.txt
├── Frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
Getting Started
Prerequisites
Install the following before running the project:
- Python 3.10 or newer
- Node.js and npm
- Git
1. Clone the repository
git clone https://github.com/YOUR-USERNAME/github-profile-explorer.git
cd github-profile-explorer
Replace YOUR-USERNAME with your GitHub username.
2. Set up the backend
Open a terminal in the project root and run:
cd Backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Start the FastAPI server:
python -m uvicorn main:app --reload
The backend will run at:
- API: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs
3. Set up the frontend
Open a second terminal in the project root:
cd Frontend
npm install
npm install axios recharts lucide-react
npm run dev
Open the local URL shown by Vite, usually:

http://localhost:5173

Keep both the backend and frontend terminals running while using the application.
GitHub API Token (Optional)
The application can retrieve public GitHub data without a token. However, GitHub applies a lower rate limit to unauthenticated requests.

To use an optional Personal Access Token:
1. Create a token in your GitHub account settings: https://github.com/settings/personal-access-tokens
2. Create a .env file inside the Backend folder.
3. Add:
GITHUB_TOKEN=your_github_token_here
4. Restart the backend.
Use a token with only the permissions required for your use case. Never commit or share your .env file or token.
API Endpoints
Method	Endpoint	Description
GET	/	Backend welcome/status response
GET	/api/health	Health check
GET	/api/profile/{username}	Fetch a public GitHub profile
GET	/api/repos/{username}	Fetch and sort public repositories
GET	/api/stats/{username}	Calculate developer statistics
GET	/api/activity/{username}	Fetch recent public events
GET	/api/compare?user1={username}&user2={username}	Compare two GitHub users


Example Usernames
Try searching for public GitHub accounts such as:
- torvalds
- octocat
Notes and Limitations
- The project uses the GitHub REST API and displays publicly available information.
- Unauthenticated GitHub API requests have a limited request quota. An optional token can increase the limit.
- Recent activity is based on the public events returned by GitHub; it is not a complete activity history.
- Language distribution is based on the primary language reported for each repository, not the number of bytes of code written in each language.
- The backend must be running locally for the frontend to retrieve data in the current local setup.
Future Improvements
- Deploy the frontend and backend for public access through a single website URL.
- Add caching to reduce repeated GitHub API requests.
- Add pagination and more repository filters.
- Improve comparison visualizations and responsive layouts.
Author
Pratishtha Verma
If you find this project useful, feel free to star the repository!
