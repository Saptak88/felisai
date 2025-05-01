from fastapi import FastAPI,UploadFile, File, Form
from pydantic import BaseModel
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
from langchain_pinecone import PineconeVectorStore
import tempfile
import os
import re
os.environ['PINECONE_API_KEY'] = "797c44ef-d4dd-4820-b40f-72df2f1440fe"  # Replace with your actual key
inference_api_key="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"

app = FastAPI()



embeddings = HuggingFaceInferenceAPIEmbeddings(
    api_key=inference_api_key, model_name="intfloat/multilingual-e5-small"
)
docsearch = PineconeVectorStore(index_name="bengalirag2", embedding=embeddings, namespace="englishcancer")

@app.get("/")
def read_root():
    return "Api Working"

class Query(BaseModel):
    query: str
    session_id: str

@app.post("/search")
async def search(query: Query):
    # Perform the similarity search
    results = docsearch.similarity_search(query.query, k=3)
    # Create context text from the search results
    context_text = "\n---\n".join([doc.page_content for doc in results])        
    return {"context": context_text}

@app.post("/search_session")
async def search_with_session(data: Query):
    # Create a temporary vector store with the requested session's namespace
    docsearch2 = PineconeVectorStore(
        index_name="bengalirag2",
        embedding=embeddings,
        namespace=data.session_id
    )

    # Perform the similarity search
    results = docsearch2.similarity_search(data.query, k=10)

    # Combine results into a single context string
    context_text = "\n---\n".join([doc.page_content for doc in results])
    return {"context": context_text}

@app.post("/upload")
async def upload_pdf(session_id: str = Form(...), file: UploadFile = File(...)):
    print(f"Received session_id: {session_id}")
    # print(f"Received file: filename={file.filename}, content_type={file.content_type}")
    # Save the uploaded PDF temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(await file.read())
        temp_path = temp_file.name

    try:
        # Load and split the document
        loader = PyPDFLoader(temp_path)
        documents = loader.load()
        for doc in documents:
            # Clean the text (replace newlines and normalize spaces)
            cleaned_content = doc.page_content.replace("\n", " ").strip()
            cleaned_content = re.sub(r'\s+', ' ', cleaned_content)  # Replace multiple spaces with single space  
            # Update the document's content while preserving metadata
            doc.page_content = cleaned_content
        
        splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=200)
        split_docs = splitter.split_documents(documents)


        # for i, doc in enumerate(split_docs):
        #     print(f"Document {i+1}:")
        #     print(doc.page_content)  # Printing the content of each split document
        #     print("-" * 80)
        # Upload to Pinecone under session_id namespace
        PineconeVectorStore.from_documents(
            split_docs,
            embeddings,
            index_name="bengalirag2",
            namespace=session_id
        )

        return {"message": "PDF uploaded and indexed successfully", "namespace": session_id}
    finally:
        os.remove(temp_path)
