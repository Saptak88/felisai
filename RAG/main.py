from fastapi import FastAPI,UploadFile, File, Form
import fitz 
import uuid
from pydantic import BaseModel
from pinecone import Pinecone
import tempfile
import os
import re

pc = Pinecone(api_key="pcsk_51s9aK_LAeBBHAaeUYC5RNbKPQeWD2zoZJb6QjttLNMMx59eP7fmJoPvPLkKYAiuVbKUff")

app = FastAPI()



index_name = "rag2"
index = pc.Index(index_name)

@app.get("/")
def read_root():
    return "Api Working"

class Query(BaseModel):
    query: str
    session_id: str

@app.post("/search")
async def search(query: Query):
    # Perform the similarity search
    results = index.search(
    namespace="cancer",
    query={
        "top_k": 10,
        "inputs": {
            'text': query.query
        }
    }
)
    context_text = []

    # Iterate over the hits and extract the text for each result
    for hit in results['result']['hits']:
        # Get the 'text' field from each result's fields
        text = hit['fields']['text']
        
        # Optionally, you can add some formatting here if needed, like:
        context_text.append(f"Text: {text}\n")

    # Join the text chunks into a single string
    context_text = "\n\n".join(context_text)

    # Return the combined context as the response
    return {"context": "context_text"}

@app.post("/search_session")
async def search_with_session(data: Query):
    # Create a temporary vector store with the requested session's namespace
    results = index.search(
    namespace=data.session_id,
    query={
        "top_k": 10,
        "inputs": {
            'text': data.query
        }
    }
)

    context_text = []

    # Iterate over the hits and extract the text for each result
    for hit in results['result']['hits']:
        # Get the 'text' field from each result's fields
        text = hit['fields']['text']
        
        # Optionally, you can add some formatting here if needed, like:
        context_text.append(f"Text: {text}\n")

    # Join the text chunks into a single string
    context_text = "\n\n".join(context_text)

    # Return the combined context as the response
    return {"context": context_text}


def extract_chunks_from_pdf(file_path: str) -> list[dict]:
    pdf = fitz.open(file_path)
    records = []

    for page_num, page in enumerate(pdf, start=1):
        text = page.get_text()
        text = text.strip().replace("\n", " ")

        chunk_size = 1500
        overlap = 400
        start = 0
        end = chunk_size

        while start < len(text):
            chunk = text[start:end].strip()
            if chunk:
                records.append({
                    "_id": str(uuid.uuid4()),
                    "text": chunk,
                })
            start += chunk_size - overlap
            end = start + chunk_size

    return records

def batch_upsert(index, session_id, records, batch_size=80):
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        index.upsert_records(session_id, batch)

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
        records = extract_chunks_from_pdf(temp_path)
        batch_upsert(index, session_id, records)
        return {"message": f"Upserted {len(records)} records."}
    finally:
        os.remove(temp_path)
