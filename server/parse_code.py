import ast
import json
from pathlib import Path

class CodeAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.structure = {
            "classes": [],
            "functions": [],
            "imports":[]
        }
        self.current_class = None

    def visit_Import(self, node):
        for alias in node.names:
            self.structure["imports"].append(alias.name)
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if node.module:
            self.structure["imports"].append(node.module)
        self.generic_visit(node)

    def visit_ClassDef(self, node):
        """Captures class definitions and their docstrings."""
        class_info = {
            "name": node.name,
            "docstring": ast.get_docstring(node),
            "methods": []
        }
        
        # Track context to know if methods belong to this class
        previous_class = self.current_class
        self.current_class = class_info
        
        # Visit nodes inside the class
        self.generic_visit(node)
        
        self.structure["classes"].append(class_info)
        self.current_class = previous_class

    def visit_FunctionDef(self, node):
        """Captures standalone functions or class methods."""
        func_info = {
            "name": node.name,
            "docstring": ast.get_docstring(node),
            "args": [arg.arg for arg in node.args.args]
        }

        if self.current_class is not None:
            self.current_class["methods"].append(func_info)
        else:
            self.structure["functions"].append(func_info)

        self.generic_visit(node)

def parse_single_file(file_path):
    """Parses an individual python file content string or path."""    
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
            file_content=file.read()

        tree=ast.parse(file_content)
        analyzer = CodeAnalyzer()
        analyzer.visit(tree)
        return analyzer.structure

    except Exception as e:
        return {"error": str(e)}

def parse_code_directory(dir_path):
    """Recursively walks through a folder and parses all nested .py files."""
    codebase_data = {}
    target_path = Path(dir_path)
    
    for file_path in target_path.rglob("*.py"):
        # Skip virtual environments, cache, and hidden directories
        if any(part.startswith('.') or part in [".venv", "__pycache__", "venv"] for part in file_path.parts):
            continue
            
        try:
            relative_name = str(file_path.relative_to(target_path))
            codebase_data[relative_name] = parse_single_file(file_path)
        except Exception as e:
            print(f"Error parsing {file_path}: {e}")
            
    return codebase_data

if __name__ == "__main__":
    result = parse_code_directory(file_path="./server/main.py")
    print(json.dumps(result, indent=4))
