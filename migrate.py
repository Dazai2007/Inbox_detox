"""
Database migration script
Run this to create or update database tables
"""

from app.database.database import engine
from app.models.models import Base

def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

def drop_tables():
    """Drop all database tables (use with caution!)."""
    print("Dropping all database tables...")
    Base.metadata.drop_all(bind=engine)
    print("🗑️ Database tables dropped!")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--drop":
        confirmation = input("Are you sure you want to drop all tables? (yes/no): ")
        if confirmation.lower() == "yes":
            drop_tables()
        else:
            print("Operation cancelled.")
    else:
        create_tables()