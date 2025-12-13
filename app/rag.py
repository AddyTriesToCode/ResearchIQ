#This is the module where our RAG piepline functions
from typing import List, Dict
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_ollama import ChatOllama
from langchain_classic.chains import RetrievalQA
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_classic.memory import ConversationBufferMemory
from app.config import VECTOR_DB_DIR
from app.config import EMBEDDING_MODEL,CHAT_MODEL

# Store for conversation histories per session
conversation_histories: Dict[str, ConversationBufferMemory] = {}




#This function returns a persistent Chroma collection, with a particular embedding function
def get_vectorstore(collection_name:str="researchiq")->Chroma:

    embeddings=HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL) #Makes an embeddings client.
    return Chroma(collection_name=collection_name,
                  embedding_function=embeddings,
                  persist_directory=VECTOR_DB_DIR)


#This function adds chunks to the Chroma VectorStore in format : { embedding( OR vector), text (the real chunk text) , metadata(of the chunk)}
def index_chunks(chunks:List[Document],collection_name:str="researchiq"):
    vs=get_vectorstore(collection_name)
    vs.add_documents(chunks)
    vs.persist()
    return vs



#This function defines and returns a retriever object which retrieves chunks from the Chroma collection
def get_retriever(collection_name:str="researchiq"):
    vs=get_vectorstore(collection_name)
    retriever=vs.as_retriever(search_kwargs={"k":5})
    return retriever

#This defines a RAG Q&A chain, which when invoked with a query, will gather query relevant chunks by the retriever, pass them to LLM, and return a full formed answer returned by our model
def get_qa_chain(collection_name:str="researchiq"):
    retriever=get_retriever(collection_name)
    #This creates an instance of an LLM with our desired model using Ollama
    llm=ChatOllama(model=CHAT_MODEL)
    qa_chain=RetrievalQA.from_chain_type(llm=llm,retriever=retriever,chain_type="stuff",return_source_documents=True)
    return qa_chain

#This is the main function which will be called at our /chat endpoint. It invokes the RAG Q&A chain with our query, and returns the result.

def answer_question(question:str, session_id:str="default", collection_name="researchiq"):
    qa=get_qa_chain(collection_name)
    
    # Initialize memory for this session if it doesn't exist
    if session_id not in conversation_histories:
        conversation_histories[session_id] = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    
    memory = conversation_histories[session_id]
    
    # Build context from chat history
    chat_history = memory.load_memory_variables({})["chat_history"]
    history_text = "\n".join([f"{msg}" for msg in chat_history[-4:]]) if chat_history else ""  # Last 4 messages for context
    
    # Enhance question with context if it's a follow-up
    enhanced_question = question
    if history_text and len(chat_history) > 0:
        enhanced_question = f"Previous context:\n{history_text}\n\nCurrent question: {question}"
    
    result=qa.invoke({"query":enhanced_question})
    answer = result["result"]
    
    # Store in memory
    memory.save_context({"input": question}, {"output": answer})
    
    return {"answer": answer, "source_docs": result.get("source_documents", [])}
   #This returns the answer as a dictionary with the result , as well as the source.
    



