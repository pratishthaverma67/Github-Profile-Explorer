
import requests

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# ==========================================
# CONFIGURATION
# ==========================================

GITHUB_API = "https://api.github.com"

HEADERS = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "GitHub-Profile-Explorer"
}


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="GitHub Profile Explorer",
    description=(
        "Explore GitHub developers, repositories, "
        "statistics, activities and developer comparisons."
    ),
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://github-profile-explorer-rust.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ==========================================
# GITHUB API HELPER
# ==========================================

def github_get(endpoint, params=None):
    """Fetch public data from GitHub REST API."""

    try:
        response = requests.get(
            f"{GITHUB_API}{endpoint}",
            headers=HEADERS,
            params=params,
            timeout=20
        )

        if response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail="GitHub user or resource not found."
            )

        if response.status_code == 401:
            raise HTTPException(
                status_code=502,
                detail="GitHub rejected the request. Please try again later."
            )

        if response.status_code == 403:
            remaining = response.headers.get("X-RateLimit-Remaining")

            if remaining == "0":
                raise HTTPException(
                    status_code=429,
                    detail="GitHub API rate limit exceeded. Try again later."
                )

            raise HTTPException(
                status_code=403,
                detail="GitHub denied the request. Please try again later."
            )

        if response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail="GitHub API rate limit exceeded."
            )

        response.raise_for_status()
        return response.json()

    except HTTPException:
        raise

    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="GitHub API request timed out."
        )

    except requests.exceptions.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Unable to connect to GitHub. Check your connection."
        )


# ==========================================
# PROFILE SERVICE
# ==========================================

def fetch_profile(username):
    return github_get(f"/users/{username}")


# ==========================================
# REPOSITORY SERVICE
# ==========================================

def fetch_repositories(username):

    repositories = []
    page = 1

    while True:

        data = github_get(
            f"/users/{username}/repos",
            params={
                "per_page": 100,
                "page": page,
                "sort": "updated",
                "direction": "desc"
            }
        )

        repositories.extend(data)

        if len(data) < 100:
            break

        page += 1

    return repositories


# ==========================================
# STATISTICS SERVICE
# ==========================================

def calculate_statistics(profile, repositories):

    total_stars = sum(
        repo.get("stargazers_count", 0)
        for repo in repositories
    )

    total_forks = sum(
        repo.get("forks_count", 0)
        for repo in repositories
    )

    total_watchers = sum(
        repo.get("watchers_count", 0)
        for repo in repositories
    )

    language_counts = {}

    for repo in repositories:

        language = repo.get("language")

        if language:
            language_counts[language] = (
                language_counts.get(language, 0) + 1
            )

    total_language_repos = sum(language_counts.values())

    language_distribution = [
        {
            "language": language,
            "repositories": count,
            "percentage": round(
                (count / total_language_repos) * 100, 2
            ) if total_language_repos else 0
        }
        for language, count in sorted(
            language_counts.items(),
            key=lambda item: item[1],
            reverse=True
        )
    ]

    return {
        "total_repositories": len(repositories),
        "followers": profile.get("followers", 0),
        "following": profile.get("following", 0),
        "total_stars": total_stars,
        "total_forks": total_forks,
        "total_watchers": total_watchers,
        "language_distribution": language_distribution
    }


# ==========================================
# DEVELOPER SUMMARY SERVICE
# ==========================================

def create_summary(username):

    profile = fetch_profile(username)
    repositories = fetch_repositories(username)

    statistics = calculate_statistics(
        profile,
        repositories
    )

    return {
        "profile": profile,
        "repositories": repositories,
        "statistics": statistics
    }


# ==========================================
# HEALTH AND HOME
# ==========================================

@app.get("/")
def home():

    return {
        "message": "GitHub Profile Explorer API is running!",
        "status": "success",
        "documentation": "/docs"
    }


@app.get("/api/health")
def health():

    return {
        "status": "healthy",
        "backend": "FastAPI",
        "github_api": "Connected through REST API",
        "authentication": False
    }


# ==========================================
# 1. PROFILE SEARCH
# ==========================================

@app.get("/api/profile/{username}")
def get_profile(username: str):

    profile = fetch_profile(username)

    return {
        "username": profile["login"],
        "name": profile.get("name"),
        "bio": profile.get("bio"),
        "avatar": profile.get("avatar_url"),
        "location": profile.get("location"),
        "company": profile.get("company"),
        "blog": profile.get("blog"),
        "email": profile.get("email"),
        "github_url": profile.get("html_url"),
        "followers": profile.get("followers", 0),
        "following": profile.get("following", 0),
        "public_repositories": profile.get("public_repos", 0),
        "created_at": profile.get("created_at")
    }


# ==========================================
# 2. REPOSITORY EXPLORER
# ==========================================

@app.get("/api/repos/{username}")
def get_repositories(
    username: str,
    sort_by: str = Query(
        default="updated",
        pattern="^(stars|forks|updated|name)$"
    )
):

    repositories = fetch_repositories(username)

    sort_functions = {
        "stars": lambda repo: repo.get("stargazers_count", 0),
        "forks": lambda repo: repo.get("forks_count", 0),
        "updated": lambda repo: repo.get("updated_at") or "",
        "name": lambda repo: repo.get("name", "").lower()
    }

    repositories.sort(
        key=sort_functions[sort_by],
        reverse=(sort_by != "name")
    )

    return {
        "username": username,
        "total": len(repositories),
        "sort_by": sort_by,
        "repositories": [
            {
                "id": repo["id"],
                "name": repo["name"],
                "description": repo.get("description"),
                "language": repo.get("language"),
                "stars": repo.get("stargazers_count", 0),
                "forks": repo.get("forks_count", 0),
                "watchers": repo.get("watchers_count", 0),
                "url": repo.get("html_url"),
                "updated_at": repo.get("updated_at"),
                "is_fork": repo.get("fork", False)
            }
            for repo in repositories
        ]
    }


# ==========================================
# 3. DEVELOPER STATISTICS
# ==========================================

@app.get("/api/stats/{username}")
def get_statistics(username: str):

    summary = create_summary(username)

    return {
        "username": summary["profile"]["login"],
        "statistics": summary["statistics"]
    }


# ==========================================
# 4. RECENT PUBLIC ACTIVITY
# ==========================================

@app.get("/api/activity/{username}")
def get_activity(username: str):

    events = github_get(
        f"/users/{username}/events/public",
        params={"per_page": 30}
    )

    activities = []

    for event in events:

        repository = event.get("repo", {})
        payload = event.get("payload", {})

        activities.append({
            "id": event.get("id"),
            "type": event.get("type"),
            "action": payload.get("action"),
            "repository": repository.get("name"),
            "repository_url": (
                f"https://github.com/{repository.get('name')}"
                if repository.get("name")
                else None
            ),
            "created_at": event.get("created_at"),
            "public": event.get("public", True)
        })

    return {
        "username": username,
        "total_events": len(activities),
        "activities": activities
    }


# ==========================================
# 5. DEVELOPER COMPARISON
# ==========================================

@app.get("/api/compare")
def compare_developers(
    user1: str,
    user2: str
):

    if user1.lower() == user2.lower():
        raise HTTPException(
            status_code=400,
            detail="Please enter two different GitHub usernames."
        )

    developer1 = create_summary(user1)
    developer2 = create_summary(user2)

    return {
        "developer_1": {
            "profile": developer1["profile"],
            "statistics": developer1["statistics"]
        },
        "developer_2": {
            "profile": developer2["profile"],
            "statistics": developer2["statistics"]
        }
    }
