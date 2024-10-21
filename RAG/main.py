from fastapi import FastAPI
from pydantic import BaseModel
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
from langchain_pinecone import PineconeVectorStore
import os
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

@app.post("/search")
async def search(query: Query):
    # Perform the similarity search
    results = docsearch.similarity_search(query.query, k=3)
    # Create context text from the search results
    context_text = "\n---\n".join([doc.page_content for doc in results])        
    return {"context": context_text}
