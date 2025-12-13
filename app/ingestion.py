 # This is the indexing/ingestion module which is invoked whenever a new PDF is uploaded
# Returns chunks of an uploaded PDF

from pathlib import Path
from typing import List
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

from app.config import UPLOADS_DIR

#Steps : Store PDF in uploads-->Retrieve as documents-->Chunk docments-->Return chunks

#Uploads the file to the uploads directory 
def save_upload_file(file_obj:bytes,filename:str)->Path:
    upload_path= Path(UPLOADS_DIR)/filename # New path with filename for every file
    with open(upload_path,"wb") as f:
        f.write(file_obj)
    return upload_path

#Load the uploaded file as documents
def load_pdf(path:Path)->List[Document]:
    loader=PyPDFLoader(path)
    docs=loader.load()  #Docs are a list of Document objects created from the uploaded PDF
    return docs

def chunk(docs:List[Document],chunk_size:int=1000,chunk_overlap:int=150)->List[Document]:
    splitter=RecursiveCharacterTextSplitter(chunk_size=chunk_size,chunk_overlap=chunk_overlap,length_function=len)
    chunks=splitter.split_documents(docs)
    return chunks

#This will be the main function which is gonna be called durin PDF upload. It takes the uploaded file and returns chunks.
def ingest_pdf_bytes(file_obj,filename:str)->List[Document]:
    path=save_upload_file(file_obj=file_obj,filename=filename)
    docs=load_pdf(path=path)
    chunks=chunk(docs)

    #We got chunks as a list of documents. We will check if they have metadata or not and then return the chunks as a list of docs
    for c in chunks:
        c.metadata.setdefault("source",filename)
    return chunks

