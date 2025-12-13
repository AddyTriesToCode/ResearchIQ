import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()   # .env is loaded
BASE_DIR=Path(__file__).resolve().parent.parent  # BASE_DIR is set to the project root

EMBEDDING_MODEL=os.getenv("EMBEDDING_MODEL")
CHAT_MODEL=os.getenv("CHAT_MODEL")

UPLOADS_DIR=os.getenv("UPLOADS_DIR",str(BASE_DIR/"data"/"uploads"))  #SECOND PARAMETER =FALLBACK PATH COMPUTED if not loaded 
VECTOR_DB_DIR=os.getenv("VECTOR_DB_DIR",str(BASE_DIR/"uploads"/"vectordb")) #from .env file

os.makedirs(UPLOADS_DIR,exist_ok=True)
os.makedirs(VECTOR_DB_DIR,exist_ok=True)

