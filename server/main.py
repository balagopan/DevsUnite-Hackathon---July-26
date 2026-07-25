from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import tempfile
from pathlib import Path
import json
import os
from dotenv import load_dotenv
from server.generate_doc import generate_doc
from server.parse_code import parse_code_directory, parse_single_file
import traceback


load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/generate-docs")
async def generate_docs(files: list[UploadFile] = File(...)):
    try:
        codebase_data = {}
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            for file in files:
                if not file.filename.endswith(".py"):
                    continue

                file_path = temp_path / file.filename
                file_path.parent.mkdir(parents=True, exist_ok=True)
                
                content = await file.read()
                file_path.write_bytes(content)
                
                codebase_data[file.filename] = parse_single_file(file_path)

        if not codebase_data:
            raise HTTPException(status_code=400, detail="No Python (.py) files found in the uploaded content.")
        
        codebase_json = json.dumps(codebase_data, indent=4)
        
        response = generate_doc(codebase_json)
        
        return {"markdown": response["messages"][-1].content}

    except Exception as e:
        traceback.print_exc() # This will print the exact line error in your terminal console
        raise HTTPException(status_code=500, detail=str(e))


FRONTEND_DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../client/dist"))
if os.path.exists(FRONTEND_DIST_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST_DIR, html=True), name="frontend")
else:
    print(f"Warning: Frontend build directory not found at {FRONTEND_DIST_DIR}. Run 'npm run build' first.")