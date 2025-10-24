import os
from sqlmodel import SQLModel, Session, create_engine
from dotenv import load_dotenv

load_dotenv()


print('DATABASE_URL', os.getenv("DATABASE_URL"))
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=True, pool_pre_ping=True)


def init_db():
    "Create all tables in the database"
    SQLModel.metadata.create_all(engine)
    print("Database initialized successfully")
    
    
def get_session():
    with Session(engine) as session:
        yield session