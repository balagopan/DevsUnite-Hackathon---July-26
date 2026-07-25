This documentation describes a Python script designed for analyzing Python codebases. It provides functionalities to parse individual Python files or entire directories, extracting information about imports, classes, methods, and functions, including their docstrings.

---

## Table of Contents

*   [Imports](#imports)
*   [Classes](#classes)
    *   [`CodeAnalyzer`](#codeanalyzer-class)
        *   [`__init__`](#codeanalyzer-init)
        *   [`visit_Import`](#visit_import)
        *   [`visit_ImportFrom`](#visit_importfrom)
        *   [`visit_ClassDef`](#visit_classdef)
        *   [`visit_FunctionDef`](#visit_functiondef)
*   [Functions](#functions)
    *   [`parse_single_file`](#parse_single_file)
    *   [`parse_code_directory`](#parse_code_directory)
*   [Usage Example](#usage-example)

---

## Imports

The script utilizes the following standard Python libraries:

*   `ast`: For parsing Python code into Abstract Syntax Trees (ASTs).
*   `json`: For handling JSON data, likely for outputting structured analysis results.
*   `pathlib`: For object-oriented filesystem paths.

---

## Classes

### `CodeAnalyzer` Class

The `CodeAnalyzer` class is an AST visitor responsible for traversing the Abstract Syntax Tree of a Python file and extracting relevant code constructs like imports, class definitions, and function definitions. **It inherits from `ast.NodeVisitor`, a base class that provides a framework for traversing AST nodes. Its `visit_` methods (e.g., `visit_Import`, `visit_ClassDef`) are automatically called by the AST traversal mechanism when a node of the corresponding type is encountered.**

#### `__init__(self)`

Initializes the `CodeAnalyzer` instance. It typically sets up internal data structures to store the discovered imports, classes, and functions during the AST traversal.

**Parameters**:

*   `self`: The instance of the class.

#### `visit_Import(self, node)`

Handles `import` statements found in the AST. It processes nodes representing `import module` or `import module as alias` to record the imported modules.

**Parameters**:

*   `self`: The instance of the class.
*   `node`: An `ast.Import` node representing an import statement.

#### `visit_ImportFrom(self, node)`

Handles `from ... import ...` statements found in the AST. It processes nodes representing `from package import module` or `from package import name as alias` to record specific imports from modules.

**Parameters**:

*   `self`: The instance of the class.
*   `node`: An `ast.ImportFrom` node representing a "from-import" statement.

#### `visit_ClassDef(self, node)`

Captures class definitions and their docstrings during the AST traversal.

**Parameters**:

*   `self`: The instance of the class.
*   `node`: An `ast.ClassDef` node representing a class definition.

#### `visit_FunctionDef(self, node)`

Captures standalone function definitions or methods defined within classes, along with their docstrings.

**Parameters**:

*   `self`: The instance of the class.
*   `node`: An `ast.FunctionDef` (or `ast.AsyncFunctionDef`) node representing a function or method definition.

---

## Functions

### `parse_single_file`

Parses an individual Python file's content, provided either as a file path or a string. It uses the `CodeAnalyzer` to extract and structure information about the file's imports, classes, methods, and functions.

**Parameters**:

*   `file_path` (`str` or `pathlib.Path`): The path to the Python file to be parsed, or the raw content of the Python file as a string.

**Returns**:

A dictionary containing structured information about the parsed file, including imports, classes, and functions.

### `parse_code_directory`

Recursively walks through a specified folder and parses all nested `.py` files. It aggregates the analysis results from each file into a comprehensive structure.

**Parameters**:

*   `dir_path` (`str` or `pathlib.Path`): The path to the directory to be parsed.

**Returns**:

A dictionary where keys are file paths and values are the structured analysis results for each corresponding Python file found in the directory.

---

## Usage Example

Here's how you can use the `parse_single_file` and `parse_code_directory` functions to analyze your Python code.

First, let's assume you have a file named `my_module.py` and a directory `my_project` with some Python files.

**`my_module.py`**:
```python
"""A simple example module."""

import os
from datetime import datetime

class MyClass:
    """A sample class."""

    def __init__(self, name):
        """Initializes MyClass."""
        self.name = name

    def greet(self):
        """Returns a greeting."""
        return f"Hello, {self.name}!"

def standalone_function(value):
    """A function outside any class."""
    return value * 2
```

**`my_project/utils.py`**:
```python
"""Utility functions."""

def add_numbers(a, b):
    """Adds two numbers."""
    return a + b
```

**`my_project/main.py`**:
```python
"""Main application entry point."""

from .utils import add_numbers
import sys

def run_app():
    """Runs the main application logic."""
    print("Application started.")
    result = add_numbers(5, 3)
    print(f"Result: {result}")

if __name__ == "__main__":
    run_app()
```

### Analyzing a Single File

```python
import json
from pathlib import Path

# Assuming parse_single_file is available in your script
# from your_script_name import parse_single_file

# Create a dummy file for demonstration
file_content = """
\"\"\"A simple example module.\"\"\"

import os
from datetime import datetime

class MyClass:
    \"\"\"A sample class.\"\"\"

    def __init__(self, name):
        \"\"\"Initializes MyClass.\"\"\"
        self.name = name

    def greet(self):
        \"\"\"Returns a greeting.\"\"\"
        return f\"Hello, {self.name}!\"

def standalone_function(value):
    \"\"\"A function outside any class.\"\"\"
    return value * 2
"""
dummy_file_path = Path("my_module.py")
dummy_file_path.write_text(file_content)

# Use parse_single_file
# For this example, we'll simulate the output structure since the actual implementation isn't provided.
# In a real scenario, `parse_single_file(dummy_file_path)` would return this.
parsed_data = {
    "imports": ["os", {"module": "datetime", "names": ["datetime"]}],
    "classes": [
        {
            "name": "MyClass",
            "docstring": "A sample class.",
            "methods": [
                {
                    "name": "__init__",
                    "docstring": "Initializes MyClass.",
                    "args": ["self", "name"]
                },
                {
                    "name": "greet",
                    "docstring": "Returns a greeting.",
                    "args": ["self"]
                }
            ]
        }
    ],
    "functions": [
        {
            "name": "standalone_function",
            "docstring": "A function outside any class.",
            "args": ["value"]
        }
    ]
}

print("--- Analysis for my_module.py ---")
print(json.dumps(parsed_data, indent=2))

# Clean up dummy file
dummy_file_path.unlink()
```

### Analyzing a Code Directory

```python
import json
from pathlib import Path
import os

# Assuming parse_code_directory is available in your script
# from your_script_name import parse_code_directory

# Create dummy directory and files for demonstration
dummy_dir = Path("my_project")
dummy_dir.mkdir(exist_ok=True)

(dummy_dir / "utils.py").write_text("""
\"\"\"Utility functions.\"\"\"

def add_numbers(a, b):
    \"\"\"Adds two numbers.\"\"\"
    return a + b
""")

(dummy_dir / "main.py").write_text("""
\"\"\"Main application entry point.\"\"\"

from .utils import add_numbers
import sys

def run_app():
    \"\"\"Runs the main application logic.\"\"\"
    print(\"Application started.\")
    result = add_numbers(5, 3)
    print(f\"Result: {result}\")

if __name__ == \"__main__\":
    run_app()
""")

# Use parse_code_directory
# For this example, we'll simulate the output structure.
# In a real scenario, `parse_code_directory(dummy_dir)` would return this.
parsed_directory_data = {
    str(dummy_dir / "utils.py"): {
        "imports": [],
        "classes": [],
        "functions": [
            {
                "name": "add_numbers",
                "docstring": "Adds two numbers.",
                "args": ["a", "b"]
            }
        ]
    },
    str(dummy_dir / "main.py"): {
        "imports": [{"module": ".utils", "names": ["add_numbers"]}, "sys"],
        "classes": [],
        "functions": [
            {
                "name": "run_app",
                "docstring": "Runs the main application logic.",
                "args": []
            }
        ]
    }
}

print("\n--- Analysis for my_project directory ---")
print(json.dumps(parsed_directory_data, indent=2))

# Clean up dummy directory and files
for f in dummy_dir.iterdir():
    f.unlink()
dummy_dir.rmdir()
```