# ResearchIQ - PDF Q&A Research Assistant 🚀

**AI-powered document analysis tool** that lets you upload research papers, reports, or any PDF and get instant, accurate answers with sources cited using Retrieval-Augmented Generation (RAG).

---

## ✨ Key Features

- 📁 **Multi-PDF Upload** - Upload and query across multiple documents simultaneously
- ⚡ **Fast Response** - ChromaDB vector search + Ollama Llama model generation
- 💬 **Chat History** - Context-aware conversations with session management
- 📊 **Source Citations** - Get answers with specific page references and content previews
- 🎯 **RAG Pipeline** - Retrieval-Augmented Generation with HuggingFace embeddings
- 🔄 **Persistent Storage** - Vector database persists across sessions

---

## 🛠 Tech Stack

### Backend
- **FastAPI** - High-performance REST API framework
- **LangChain** - RAG pipeline orchestration
- **ChromaDB** - Vector database for document embeddings
- **Ollama** - Local LLM inference (Chat model)
- **HuggingFace Embeddings** - Document vectorization
- **PyPDFLoader** - PDF document parsing

### Frontend
- **React 19.2** - Modern UI framework
- **React Scripts** - Build tooling

### AI/ML
- **Ollama Chat Models** - Local language model inference
- **HuggingFace Embeddings** - Sentence transformers for semantic search
- **Retrieval-Augmented Generation** - Context-aware answer generation

---

## 📁 Project Structure

```
pdf_query_rag/
├── app/
│   ├── __init__.py
│   ├── config.py           # Configuration and environment variables
│   ├── ingestion.py        # PDF processing and chunking logic
│   ├── main.py             # FastAPI application and endpoints
│   └── rag.py              # RAG pipeline and vector store management
├── frontend/
│   ├── public/             # Static assets
│   ├── src/                # React components
│   └── package.json        # Frontend dependencies
├── uploads/
│   ├── data/               # Uploaded PDF files
│   └── vectordb/           # ChromaDB persistent storage
├── requirements.txt        # Python dependencies
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

1. **Python 3.8+** installed
2. **Node.js 14+** and npm installed
3. **Ollama** installed and running locally ([Install Ollama](https://ollama.ai))

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd pdf_query_rag
```

#### 2. Backend Setup

**Create a virtual environment:**
```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac
```

**Install Python dependencies:**
```bash
pip install -r requirements.txt
```

**Create a `.env` file in the project root:**
```env
# Embedding model (HuggingFace)
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Chat model (Ollama)
CHAT_MODEL=llama3

# Optional: Custom paths
UPLOADS_DIR=./data/uploads
VECTOR_DB_DIR=./uploads/vectordb
```

**Pull the Ollama model:**
```bash
ollama pull llama3
# or use another model like: ollama pull mistral
```

#### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

## 🎮 Running the Application

### Start Backend Server
```bash
# From project root with activated virtual environment
cd app
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

### Start Frontend Development Server
```bash
# In a new terminal
cd frontend
npm start
```

Frontend will be available at: `http://localhost:3000`

---

## 📡 API Endpoints

### 1. Upload PDF
**POST** `/uploads`

Upload a PDF file for processing and indexing.

```bash
curl -X POST "http://localhost:8000/uploads" \
  -F "file=@document.pdf"
```

**Response:**
```json
{
  "status": "ok",
  "chunks_indexed": 42
}
```

### 2. Chat with Documents
**POST** `/chat`

Ask questions about uploaded documents.

```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the main conclusion of the paper?",
    "session_id": "user123"
  }'
```

**Response:**
```json
{
  "answer": "The main conclusion is...",
  "sources": [
    {
      "source": "document.pdf",
      "page": 5,
      "content": "Excerpt from the document..."
    }
  ]
}
```

### 3. Health Check
**GET** `/`

Check if the API is running.

```bash
curl http://localhost:8000/
```

---

## 🔧 How It Works

### RAG Pipeline Flow

1. **Document Ingestion** ([ingestion.py](app/ingestion.py))
   - PDF is uploaded via `/uploads` endpoint
   - File is saved to `uploads/data/` directory
   - PyPDFLoader extracts text from PDF
   - RecursiveCharacterTextSplitter chunks text (1000 chars, 150 overlap)
   - Metadata (source filename, page numbers) is added to chunks

2. **Vector Indexing** ([rag.py](app/rag.py))
   - HuggingFace embeddings model converts chunks to vectors
   - Vectors are stored in ChromaDB with persistence
   - Collection name: `researchiq`

3. **Query Processing** ([rag.py](app/rag.py))
   - User question is received via `/chat` endpoint
   - Session-based conversation history is maintained
   - Question is enhanced with recent chat context (last 4 messages)
   - Vector similarity search retrieves top 5 relevant chunks
   - Chunks are passed to Ollama LLM as context
   - LLM generates answer based on retrieved context
   - Answer is returned with source citations

### Session Management
- Each user session maintains separate conversation history
- Context from previous questions enhances follow-up queries
- Conversation buffer stores last interactions for context-aware responses

---

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EMBEDDING_MODEL` | HuggingFace embedding model | `sentence-transformers/all-MiniLM-L6-v2` |
| `CHAT_MODEL` | Ollama chat model name | `llama3` |
| `UPLOADS_DIR` | Directory for uploaded PDFs | `./data/uploads` |
| `VECTOR_DB_DIR` | ChromaDB persistence directory | `./uploads/vectordb` |

---

## 🧪 Testing

### Backend Testing
```bash
# Run backend tests (if implemented)
pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

---

## 📦 Dependencies

### Backend (Python)
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `langchain` - LLM orchestration
- `langchain-community` - Community integrations
- `langchain-ollama` - Ollama integration
- `chromadb` - Vector database
- `sentence-transformers` - Embeddings
- `pypdf` - PDF parsing
- `python-dotenv` - Environment management
- `pydantic` - Data validation

### Frontend (JavaScript)
- `react` - UI framework
- `react-dom` - React rendering
- `react-scripts` - Build tools
- Testing libraries

---

## 🎯 Use Cases

- 📚 **Research Paper Analysis** - Upload academic papers and ask about methodology, findings, conclusions
- 📄 **Document Q&A** - Query technical documentation, manuals, or reports
- 📖 **Study Assistant** - Upload textbooks or study materials for quick reference
- 💼 **Business Intelligence** - Analyze contracts, proposals, or business documents
- 🔍 **Information Extraction** - Find specific information across multiple documents

---

## 🛠️ Customization

### Change Embedding Model
Edit `.env` file:
```env
EMBEDDING_MODEL=sentence-transformers/all-mpnet-base-v2
```

### Change LLM Model
Pull and configure different Ollama model:
```bash
ollama pull mistral
```

Update `.env`:
```env
CHAT_MODEL=mistral
```

### Adjust Chunking Parameters
In [ingestion.py](app/ingestion.py), modify the `chunk()` function:
```python
chunk_size=1500,      # Increase for longer chunks
chunk_overlap=200     # Increase for more context overlap
```

### Adjust Retrieval Parameters
In [rag.py](app/rag.py), modify the retriever:
```python
retriever = vs.as_retriever(search_kwargs={"k": 10})  # Retrieve more chunks
```

---

## 🐛 Troubleshooting

### Ollama Connection Issues
```bash
# Check if Ollama is running
ollama list

# Restart Ollama service
ollama serve
```

### ChromaDB Persistence Issues
Delete the vector database and re-upload documents:
```bash
rm -rf uploads/vectordb/*
```

### Import Errors
Ensure all dependencies are installed:
```bash
pip install -r requirements.txt --upgrade
```

### Port Already in Use
Change the port in the uvicorn command:
```bash
uvicorn main:app --reload --port 8001
```

---

## 🚀 Deployment

### Backend Deployment
- Deploy FastAPI app to services like **Railway**, **Render**, or **AWS EC2**
- Ensure Ollama is installed on the server or use API-based LLM services
- Configure environment variables in production

### Frontend Deployment
```bash
cd frontend
npm run build
```
Deploy the `build/` folder to **Vercel**, **Netlify**, or **AWS S3**

---

## 📈 Future Enhancements

- [ ] Support for multiple document formats (Word, Excel, Text)
- [ ] Advanced filtering by document metadata
- [ ] User authentication and multi-user support
- [ ] Conversation export functionality
- [ ] Batch processing for multiple PDFs
- [ ] Cloud-based LLM integration (OpenAI, Anthropic)
- [ ] Enhanced UI with markdown rendering
- [ ] Document summarization feature
- [ ] Multi-language support

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👥 Authors

- Your Name - Initial work

---

## 🙏 Acknowledgments

- LangChain for RAG framework
- Ollama for local LLM inference
- HuggingFace for embedding models
- FastAPI for the backend framework
- React team for the frontend framework

---

## 📧 Contact

For questions or support, please open an issue or contact [your-email@example.com]

---
