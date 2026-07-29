# 📚 AI Python Documentation Generator

A full-stack application that automatically generates comprehensive, GitHub-style Markdown documentation for your Python projects. It analyzes your code's structure to extract classes, functions, and docstrings, and then uses a multi-agent AI workflow powered by Google Gemini and LangGraph to write, review, and refine the documentation. At present it only anlalyzess oython files, but can be upgraded to analyze other files as well.

## ✨ Features

* **Drag-and-Drop Interface:** Easily upload individual Python files or entire project folders via a clean, responsive React frontend.
* **Intelligent Code Parsing:** Safely extracts imports, classes, functions, and docstrings using Python's native `ast` module without executing the code.
* **Multi-Agent AI Workflow:** Utilizes LangGraph to orchestrate a sequence of agents (Generator, Validator, Modifier, Finalizer) ensuring high-quality, accurate documentation.
* **Real-time Markdown Preview:** View the generated documentation instantly with built-in syntax highlighting and a sleek dark-mode UI.
* **One-Click Download:** Export the generated documentation directly as a `DOCUMENTATION.md` file.

## 🛠️ Tech Stack

### Frontend
* React (via Vite)
* Axios for API requests
* `react-markdown` & `react-syntax-highlighter` for rendering

### Backend
* FastAPI & Uvicorn
* Python `ast` module for secure code parsing
* LangGraph & LangChain for AI orchestration
* Google Generative AI (`gemini-2.5-flash`)

---

## 🚀 Getting Started

### Prerequisites
* Python 3.9+
* Node.js & npm
* A Google Gemini API Key

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ai-docs-generator.git
   cd ai-docs-generator
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```

3. **Backend Setup:**
   ```bash
   # Create a virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install fastapi uvicorn langchain-google-genai langchain-core langgraph pydantic python-dotenv python-multipart
   ```

4. **Frontend Setup:**
   ```bash
   cd client
   npm install
   
   # Build the frontend so FastAPI can serve it statically
   npm run build
   cd ..
   ```

5. **Run the Application:**
   ```bash
   uvicorn server.main:app --reload
   ```
   Navigate to `http://localhost:8000` in your browser.

---

## 📖 Backend Architecture & Modules

The backend is structured into three core modules responsible for parsing code, orchestrating the AI, and serving the API.

### `server/main.py`
The main entry point for the FastAPI web server.
* Handles CORS and serves the built React static files.
* Provides the `/api/generate-docs` endpoint which processes file uploads, temporarily stores them, and feeds them into the code parser and doc generator.

### `server/parse_code.py`
Provides utilities for safely parsing Python source code without execution.
* **`CodeAnalyzer`**: A custom `ast.NodeVisitor` subclass designed to traverse an Abstract Syntax Tree (AST). It extracts structured information about imports, classes, functions, docstrings, and arguments.
* **`parse_single_file(file_path)`**: Reads a specific Python file, parses its AST, and returns a structured dictionary of its components.
* **`parse_code_directory(dir_path)`**: Recursively walks through a folder, skipping virtual environments and caches, to parse all nested `.py` files.

### `server/generate_doc.py`
Orchestrates the multi-step AI documentation generation process using LangGraph and Gemini.
* **`AgentState`**: A Pydantic state structure holding the context throughout the graph's execution.
* **Agents (Nodes):**
  * `generator_node`: Drafts the initial documentation based on the parsed AST JSON.
  * `validator_node`: Reviews the draft. Checks for weaknesses and areas to improve. If perfect, it routes to the finalizer; otherwise, it sends feedback to the modifier.
  * `modifier_node`: Modifies the documentation based on the validator's feedback.
  * `finalizer_node`: Strips away unwanted conversational AI text and ensures only raw, valid Markdown is returned.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
