# Python Project Documentation

This document provides an overview and detailed documentation for the Python scripts in this project.

---

## `generate_doc.py`

This script is responsible for generating documentation, likely leveraging AI models (Google GenAI) and LangChain/LangGraph for orchestrating a multi-step process. It defines the workflow for generating, validating, modifying, and finalizing documentation content.

### Classes

#### `AgentState`

A Pydantic model defining the state structure for the LangGraph agent. It holds the intermediate and final data throughout the documentation generation process.

**Usage Example**:

```python
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, START

# Assuming AgentState is defined like this:
class AgentState(TypedDict):
    code_content: str
    documentation: str
    errors: List[str]
    # ... other state variables

# Example of initializing state
initial_state = AgentState(code_content="...", documentation="", errors=[])
```

#### `vallidator_content`

A Pydantic model used to structure content specifically for validation steps within the documentation generation workflow.

**Usage Example**:

```python
from pydantic import BaseModel, Field

class vallidator_content(BaseModel):
    is_valid: bool = Field(description="Whether the content is valid according to checks.")
    feedback: str = Field(description="Feedback on validation issues.")

# Example of using the model
validation_result = vallidator_content(is_valid=True, feedback="No issues found.")
```

#### `content`

A Pydantic model likely used to structure the core documentation content being generated or processed.

**Usage Example**:

```python
from pydantic import BaseModel, Field

class content(BaseModel):
    title: str = Field(description="The title of the documentation section.")
    body: str = Field(description="The main body of the documentation.")
    sections: List[str] = Field(default_factory=list, description="List of sub-sections.")

# Example of creating content
doc_content = content(title="My Function", body="This function does X.", sections=["Parameters", "Usage"])
```

### Functions

#### `generator_node(state)`

This function acts as a node in a LangGraph workflow. It's responsible for generating the initial draft of the documentation based on the current `state`.

**Parameters**:

*   `state`: The current `AgentState` object containing information like the code content to be documented.

**Usage Example**:

```python
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, START

# Assuming AgentState is defined
class AgentState(TypedDict):
    code_content: str
    documentation: str
    errors: List[str]

def generator_node(state: AgentState) -> AgentState:
    print("Generating initial documentation...")
    # Simulate documentation generation
    state["documentation"] = "Initial documentation draft for: " + state["code_content"][:20] + "..."
    return state

# Example call (within a LangGraph context)
current_state = {"code_content": "def my_func(): pass", "documentation": "", "errors": []}
new_state = generator_node(current_state)
print(new_state["documentation"])
```

#### `vallidator_node(state)`

This function serves as a validation node in the LangGraph workflow. It checks the generated documentation for correctness, completeness, or adherence to specific guidelines, updating the `state` with validation results or feedback.

**Parameters**:

*   `state`: The current `AgentState` object containing the generated documentation and other relevant data.

**Usage Example**:

```python
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, START

# Assuming AgentState is defined
class AgentState(TypedDict):
    code_content: str
    documentation: str
    errors: List[str]

def vallidator_node(state: AgentState) -> AgentState:
    print("Validating documentation...")
    if "TODO" in state["documentation"]:
        state["errors"].append("Documentation contains 'TODO' markers.")
    if not state["documentation"]:
        state["errors"].append("Documentation is empty.")
    return state

# Example call (within a LangGraph context)
current_state = {"code_content": "...", "documentation": "This is a TODO doc.", "errors": []}
new_state = vallidator_node(current_state)
print(new_state["errors"])
```

#### `modifier_node(state)`

This function acts as a modification node in the LangGraph workflow. It's responsible for making corrections or improvements to the documentation based on feedback or validation results, updating the `state` with the modified content.

**Parameters**:

*   `state`: The current `AgentState` object containing the documentation and any validation feedback.

**Usage Example**:

```python
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, START

# Assuming AgentState is defined
class AgentState(TypedDict):
    code_content: str
    documentation: str
    errors: List[str]

def modifier_node(state: AgentState) -> AgentState:
    print("Modifying documentation...")
    if "TODO" in state["documentation"]:
        state["documentation"] = state["documentation"].replace("TODO", "Completed")
        state["errors"] = [e for e in state["errors"] if "TODO" not in e] # Clear relevant errors
    return state

# Example call (within a LangGraph context)
current_state = {"code_content": "...", "documentation": "This is a TODO doc.", "errors": ["Documentation contains 'TODO' markers."]}
new_state = modifier_node(current_state)
print(new_state["documentation"])
print(new_state["errors"])
```

#### `finalizer_node(state)`

This function serves as the finalization node in the LangGraph workflow. It performs any last-minute processing, formatting, or saving of the documentation before the workflow concludes.

**Parameters**:

*   `state`: The final `AgentState` object containing the completed documentation.

**Usage Example**:

```python
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, START

# Assuming AgentState is defined
class AgentState(TypedDict):
    code_content: str
    documentation: str
    errors: List[str]

def finalizer_node(state: AgentState) -> AgentState:
    print("Finalizing documentation...")
    # Add a header or footer, save to file, etc.
    state["documentation"] = "# Final Documentation\n\n" + state["documentation"]
    # In a real scenario, you might save it to a file here
    return state

# Example call (within a LangGraph context)
current_state = {"code_content": "...", "documentation": "A complete doc.", "errors": []}
new_state = finalizer_node(current_state)
print(new_state["documentation"])
```

#### `generate_doc(input)`

The main entry point for initiating the documentation generation process. It takes an input (likely code content or a path) and orchestrates the LangGraph workflow through the various nodes (generator, validator, modifier, finalizer) to produce the final documentation.

**Parameters**:

*   `input`: The input data required to start the documentation generation, typically the source code to be documented.

**Usage Example**:

```python
import os
from dotenv import load_dotenv
from server.parse_code import parse_single_file # Assuming parse_code exists
# Assuming generate_doc orchestrates the graph

load_dotenv() # Load environment variables, e.g., API keys

# A simplified example of how generate_doc might be called
def generate_doc(input_data: str) -> str:
    print(f"Starting documentation generation for input: {input_data[:50]}...")
    # In a real scenario, this would involve building and running the LangGraph
    # For demonstration, let's simulate a simple output
    return f"Generated documentation for: {input_data}"

# To use it, you might first parse code
code_content_to_document = "def hello_world():\n    print('Hello')\n"
# Or parse from a file:
# code_content_to_document = parse_single_file("my_script.py")

generated_documentation = generate_doc(code_content_to_document)
print(generated_documentation)
```

### Imports

*   `langchain_google_genai`: For integrating with Google's Generative AI models via LangChain.
*   `langchain_core.prompts`: For creating and managing prompts for LLMs.
*   `langchain_core.messages`: For handling message types in conversational AI.
*   `dotenv`: For loading environment variables from a `.env` file (e.g., API keys).
*   `server.parse_code`: Imports functionality to parse Python code from the `parse_code.py` script.
*   `json`: For working with JSON data.
*   `pathlib`: For object-oriented filesystem paths.
*   `os`: For interacting with the operating system (e.g., environment variables).
*   `langgraph.graph`: Core library for defining and running stateful agent graphs.
*   `langgraph.types`: Type definitions for LangGraph.
*   `pydantic`: For data validation and settings management.
*   `typing`: For type hints.

---

## `main.py`

This script serves as the main entry point for a FastAPI web application. It sets up the server, handles API routes, serves static files, and integrates the documentation generation and code parsing functionalities.

### Imports

*   `fastapi`: The web framework for building APIs.
*   `fastapi.staticfiles`: For serving static files (e.g., HTML, CSS, JavaScript).
*   `fastapi.responses`: For creating various types of HTTP responses.
*   `fastapi.middleware.cors`: Middleware for handling Cross-Origin Resource Sharing (CORS).
*   `tempfile`: For creating temporary files and directories.
*   `pathlib`: For object-oriented filesystem paths.
*   `json`: For working with JSON data.
*   `os`: For interacting with the operating system (e.g., environment variables).
*   `dotenv`: For loading environment variables from a `.env` file.
*   `server.generate_doc`: Imports the `generate_doc` function from the `generate_doc.py` script.
*   `server.parse_code`: Imports code parsing functionality from the `parse_code.py` script.
*   `traceback`: For printing or retrieving stack trace information.

---

## `parse_code.py`

This script provides utilities for parsing Python source code. It uses Python's `ast` (Abstract Syntax Tree) module to analyze code structure, extract information about classes, functions, and imports, and their respective docstrings.

### Classes

#### `CodeAnalyzer`

A custom `ast.NodeVisitor` subclass designed to traverse a Python Abstract Syntax Tree (AST) and extract structured information about imports, classes, and functions, including their docstrings and arguments.

**Methods**:

##### `__init__(self)`

Initializes the `CodeAnalyzer` instance. It sets up internal data structures to store the parsed information, such as lists for imports, functions, and classes.

**Parameters**:

*   `self`: The instance of the `CodeAnalyzer` class.

**Usage Example**:

```python
import ast
from server.parse_code import CodeAnalyzer

analyzer = CodeAnalyzer()
```

##### `visit_Import(self, node)`

Overrides the `visit_Import` method from `ast.NodeVisitor`. This method is called when an `import module` statement is encountered in the AST. It captures the imported module names.

**Parameters**:

*   `self`: The instance of the `CodeAnalyzer` class.
*   `node`: The `ast.Import` node representing the import statement.

**Usage Example**:

```python
import ast
from server.parse_code import CodeAnalyzer

code = "import os, sys"
tree = ast.parse(code)
analyzer = CodeAnalyzer()
analyzer.visit(tree)
print(analyzer.imports) # Expected: ['os', 'sys']
```

##### `visit_ImportFrom(self, node)`

Overrides the `visit_ImportFrom` method from `ast.NodeVisitor`. This method is called when a `from module import name` statement is encountered in the AST. It captures the module and the specific names imported.

**Parameters**:

*   `self`: The instance of the `CodeAnalyzer` class.
*   `node`: The `ast.ImportFrom` node representing the `from ... import ...` statement.

**Usage Example**:

```python
import ast
from server.parse_code import CodeAnalyzer

code = "from collections import defaultdict\nfrom mypackage.sub import func"
tree = ast.parse(code)
analyzer = CodeAnalyzer()
analyzer.visit(tree)
print(analyzer.imports) # Expected: ['collections.defaultdict', 'mypackage.sub.func']
```

##### `visit_ClassDef(self, node)`

Captures class definitions and their docstrings. This method is called when a class definition is found in the AST. It extracts the class name, its docstring, and then recursively visits its methods.

**Parameters**:

*   `self`: The instance of the `CodeAnalyzer` class.
*   `node`: The `ast.ClassDef` node representing the class definition.

**Usage Example**:

```python
import ast
from server.parse_code import CodeAnalyzer

code = """
class MyClass:
    \"\"\"A sample class.\"\"\"
    def my_method(self):
        pass
"""
tree = ast.parse(code)
analyzer = CodeAnalyzer()
analyzer.visit(tree)
print(analyzer.classes[0]['name'])     # Expected: 'MyClass'
print(analyzer.classes[0]['docstring']) # Expected: 'A sample class.'
print(analyzer.classes[0]['methods'][0]['name']) # Expected: 'my_method'
```

##### `visit_FunctionDef(self, node)`

Captures standalone functions or class methods. This method is called when a function definition is found in the AST. It extracts the function's name, its docstring, and its arguments.

**Parameters**:

*   `self`: The instance of the `CodeAnalyzer` class.
*   `node`: The `ast.FunctionDef` node representing the function definition.

**Usage Example**:

```python
import ast
from server.parse_code import CodeAnalyzer

code = """
def greet(name):
    \"\"\"Greets the given name.\"\"\"
    return f"Hello, {name}"
"""
tree = ast.parse(code)
analyzer = CodeAnalyzer()
analyzer.visit(tree)
print(analyzer.functions[0]['name'])      # Expected: 'greet'
print(analyzer.functions[0]['docstring'])  # Expected: 'Greets the given name.'
print(analyzer.functions[0]['args'])       # Expected: ['name']
```

### Functions

#### `parse_single_file(file_path)`

Parses an individual Python file content string or path. This function reads the content of a specified Python file, uses `CodeAnalyzer` to parse its AST, and returns a structured dictionary of its components (imports, classes, functions).

**Parameters**:

*   `file_path`: A string representing the path to the Python file, or the content of the file itself.

**Usage Example**:

```python
from server.parse_code import parse_single_file
from pathlib import Path

# Example 1: Parsing from a file path
# Create a dummy file for demonstration
dummy_file_path = Path("temp_script.py")
dummy_file_path.write_text("""
import os

class MyUtility:
    \"\"\"Provides utility functions.\"\"\"
    def __init__(self):
        pass

def calculate_sum(a, b):
    \"\"\"Adds two numbers.\"\"\"
    return a + b
"""
)

parsed_data = parse_single_file(dummy_file_path)
print(parsed_data['functions'][0]['name']) # Expected: 'calculate_sum'
print(parsed_data['classes'][0]['docstring']) # Expected: 'Provides utility functions.'

dummy_file_path.unlink() # Clean up the dummy file

# Example 2: Parsing from a content string (if the function supports it,
# though typically it expects a path)
# Assuming an internal mechanism to handle string content if file_path isn't a real path
# For this example, we'll stick to file paths as per typical usage of 'file_path' argument.
```

#### `parse_code_directory(dir_path)`

Recursively walks through a folder and parses all nested `.py` files. This function takes a directory path, iterates through all Python files within it (and its subdirectories), and uses `parse_single_file` to collect parsing results for the entire directory structure.

**Parameters**:

*   `dir_path`: A string representing the path to the directory to be parsed.

**Usage Example**:

```python
from server.parse_code import parse_code_directory
from pathlib import Path
import os

# Create a dummy directory structure for demonstration
temp_dir = Path("temp_project")
temp_dir.mkdir(exist_ok=True)
(temp_dir / "module_a.py").write_text("def func_a(): pass")
(temp_dir / "sub_dir").mkdir(exist_ok=True)
(temp_dir / "sub_dir" / "module_b.py").write_text("class ClassB: pass")

parsed_project_data = parse_code_directory(temp_dir)

print(parsed_project_data.keys()) # Expected: dict_keys(['module_a.py', 'sub_dir/module_b.py'])
print(parsed_project_data['module_a.py']['functions'][0]['name']) # Expected: 'func_a'

# Clean up the dummy directory
import shutil
shutil.rmtree(temp_dir)
```

### Imports

*   `ast`: Python's Abstract Syntax Tree module for parsing Python source code.
*   `json`: For working with JSON data, potentially for outputting parsed results.
*   `pathlib`: For object-oriented filesystem paths, making path manipulations cleaner.