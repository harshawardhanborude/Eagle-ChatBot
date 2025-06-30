# import libraries

import langchain
import pinecone
# from langchain.document_loaders import PyPDFDirectoryLoader
# from langchain.text_splitter import RecursiveCharacterTextSplitter
from pinecone import Pinecone
from langchain.vectorstores import Pinecone
# from langchain.llms import llamacpp
import os
import numpy as np
from sentence_transformers import SentenceTransformer
from pinecone.grpc import PineconeGRPC as Pinecone
# from pinecone import ServerlessSpec
import time

from google import genai


model = SentenceTransformer("all-MiniLM-L6-v2")

## Embedding Technique of Micorfsoft

pc = Pinecone(api_key="API_Key")
index = pc.Index("index-ai-agent")


def chatbot(user_input):
    print(user_input)
    embeddings_query = model.encode(user_input)

    results = index.query(
        namespace="ai_agent_namespace",
        vector=embeddings_query,
        top_k=3,
        include_values=False,
        include_metadata=True
    )

    retrieved_docs = [match['metadata']['text'] for match in results['matches']]
    single_string = " ".join(retrieved_docs)
    print({single_string})

    client = genai.Client(api_key="AIzaSyDWuj5zQ7hBNeaiL5jhrmuqmzhRHzTdqW0")

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents= user_input + single_string,
    )
    return response.text
