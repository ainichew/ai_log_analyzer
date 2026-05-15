import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, User, Organization, LogAnalysis, AuditLog, engine
from sqlalchemy import inspect, text
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def inspect_db():
    # Verify database exists
    db_path = os.getenv("DATABASE_URL", "sqlite:///./devops_ai.db").replace("sqlite:///", "")
    print(f"📍 Database path: {os.path.abspath(db_path)}")
    print(f"   File exists: {os.path.exists(db_path)}")
    if os.path.exists(db_path):
        print(f"   File size: {os.path.getsize(db_path)} bytes")
    
    # Check if tables exist
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"\n📋 Tables in database: {tables}")
    
    db = SessionLocal()
    
    print("=" * 60)
    print("📊 DATABASE INSPECTION")
    print("=" * 60)
    
    # Organizations
    orgs = db.query(Organization).all()
    print(f"\n🏢 Organizations ({len(orgs)}):")
    for org in orgs:
        user_count = db.query(User).filter(User.organization_id == org.id).count()
        print(f"   • {org.name} (slug: {org.slug})")
        print(f"     ID: {org.id}")
        print(f"     Users: {user_count}")
        print(f"     Created: {org.created_at}")
        print(f"     Active: {org.is_active}")
    
    # Users - FORCE COMMIT CHECK
    db.commit()  # Ensure all pending transactions are committed
    users = db.query(User).all()
    print(f"\n👥 Users ({len(users)}):")
    for user in users:
        org = db.query(Organization).filter(Organization.id == user.organization_id).first()
        print(f"   • {user.full_name} <{user.email}>")
        print(f"     ID: {user.id}")
        print(f"     Role: {user.role.upper()}")
        print(f"     Org: {org.name if org else 'Unknown'} ({user.organization_id})")
        print(f"     Active: {user.is_active}")
        print(f"     Last Login: {user.last_login or 'Never'}")
    
    # Raw count verification
    result = db.execute(text("SELECT COUNT(*) FROM users"))
    raw_count = result.fetchone()[0]
    print(f"\n🔍 Raw SQL user count: {raw_count}")
    
    # Analyses
    analyses = db.query(LogAnalysis).order_by(LogAnalysis.created_at.desc()).limit(10).all()
    print(f"\n🔍 Recent Analyses ({len(analyses)}):")
    for a in analyses:
        user = db.query(User).filter(User.id == a.user_id).first()
        print(f"   • {a.domain} - {a.status}")
        print(f"     ID: {a.id}")
        print(f"     By: {user.email if user else 'Unknown'}")
        print(f"     Created: {a.created_at}")
    
    print("\n" + "=" * 60)
    db.close()

if __name__ == "__main__":
    inspect_db()