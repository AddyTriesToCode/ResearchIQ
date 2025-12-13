#This is the API layer 
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.ingestion import ingest_pdf_bytes
from app.rag import index_chunks, answer_question

app=FastAPI(title="ResearchIQ")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Chatrequest(BaseModel):
    question:str
    session_id:str="default"  # Add session tracking for conversation continuity

#This is the file upload function, called when client hits "/file" path 
@app.post("/uploads")
async def upload_func(file:UploadFile=File(...)):
    file_bytes=await file.read()
    chunks=ingest_pdf_bytes(file_bytes,file.filename)
    index_chunks(chunks)
    return {"status":"ok","chunks_indexed":len(chunks)}


@app.post("/chat")
async def chat(req:Chatrequest):
    result=answer_question(req.question, session_id=req.session_id)
    sources=[]
    for doc in result["source_docs"]:
        sources.append({
            "source":doc.metadata.get("source"),
            "page":doc.metadata.get("page"),
            "content":doc.page_content[:500] #Preview of the soure doc
        })

    return {"answer":result["answer"],
            "sources":sources }

@app.get("/")
async def root():
    return {"message":"Hello World"}
