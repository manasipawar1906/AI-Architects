"""
Database placeholder.

The first prototype does not require a database because learner input is
processed directly by the API.

If the team later wants to store users/progress, this file can be extended
with SQLite or another database.
"""

DATABASE_URL = "sqlite:///./learning_path.db"


def get_database_info():
    return {
        "database": "SQLite",
        "url": DATABASE_URL,
        "status": "Not required for the current prototype",
    }
