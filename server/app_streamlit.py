import streamlit as st
from pathlib import Path
from dotenv import load_dotenv
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage
from generate_doc import generate_doc
from parse_code import parse_code_directory, parse_single_file
import tempfile

load_dotenv()

# Page configuration
st.set_page_config(page_title="AI Auto-Documentation Generator", page_icon="🤖", layout="wide")

st.title("🤖 AI-Powered Auto-Documentation Generator")
st.write("Upload a Python file or paste your code to automatically generate professional Markdown documentation.")

# # Initialize LLM Chain
# llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
# prompt = ChatPromptTemplate([
#     ("system", """You are an AI responsible for making documentations for
#     python scripts. You will be given a json file that contains the information
#     regarding the different functions, class, methods used in the script,
#     and their docstrings. Use it to write a clean Markdown description,
#     explain its parameters, and provide a usage example as well."""),
#     MessagesPlaceholder(variable_name="messages")
# ])
# llm_chain = prompt | llm

# Native Drag-and-Drop File/Directory Uploader
# uploaded_files = st.file_uploader(
#     "Drag and drop your Python files or folder here", 
#     type=["py"], 
#     accept_multiple_files="directory"  # Allows dropping or selecting multiple files/folders
# )

input_mode = st.radio("Select Input Method:", ["Upload Multiple Files", "Upload Directory"])

uploaded_files = None

if input_mode == "Upload Directory":
    # This enables the "Upload directories" button box
    uploaded_files = st.file_uploader(
        "Upload your project folder here", 
        type=["py"], 
        accept_multiple_files="directory"
    )
else:
    # This enables the standard multiple files upload box
    uploaded_files = st.file_uploader(
        "Upload Python (.py) files here", 
        type=["py"], 
        accept_multiple_files=True
    )

codebase_json = None


if uploaded_files:
    if st.button("Generate Documentation"):
        with st.spinner("Processing files and analyzing codebase structure..."):
            try:
                codebase_data = {}
                with tempfile.TemporaryDirectory() as temp_dir:
                    temp_path = Path(temp_dir)
                    
                    for uploaded_file in uploaded_files:
                        # Extract relative path if available from folder upload, fallback to filename
                        file_relative_path = getattr(uploaded_file, "name", "script.py")
                        destination_path = temp_path / file_relative_path
                        
                        destination_path.parent.mkdir(parents=True, exist_ok=True)
                        destination_path.write_bytes(uploaded_file.getvalue())
                        
                        # Parse the script code structure via AST
                        codebase_data[str(file_relative_path)] = parse_single_file(destination_path)
                
                codebase_json = json.dumps(codebase_data, indent=4)
            except Exception as e:
                st.error(f"Error parsing uploaded code: {e}")

# If JSON data was successfully compiled, send to LLM
if codebase_json:
    with st.spinner("Synthesizing documentation with Gemini..."):
        try:
            response = generate_doc(codebase_json)
            doc_content = response.content
            
            st.success("Documentation generated successfully!")
            st.markdown("---")
            st.markdown(doc_content)
            
            # Provide a download button for the generated README file
            st.download_button(
                label="Download Markdown README.md",
                data=doc_content,
                file_name="README.md",
                mime="text/markdown"
            )
        except Exception as e:
            st.error(f"LLM Generation Error: {e}")