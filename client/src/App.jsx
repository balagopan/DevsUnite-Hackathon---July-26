import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import ReactMarkdown from 'react-markdown';
// Import the syntax highlighter and a dark theme that matches your screenshots
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function App() {
  const [files, setFiles] = useState([]);
  const [uploadType, setUploadType] = useState('files');
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleDownload = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'DOCUMENTATION.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    if (files.length === 0) {
      setError('Please select or drop files first.');
      return;
    }

    setLoading(true);
    setError('');
    setMarkdown('');

    const formData = new FormData();
    files.forEach((file) => {
      const filePath = uploadType === 'folder' && file.webkitRelativePath ? file.webkitRelativePath : file.name;
      formData.append('files', file, filePath);
    });

    try {
      const response = await axios.post('http://localhost:8000/api/generate-docs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMarkdown(response.data.markdown);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', fontFamily: 'Arial, sans-serif', padding: '20px', textAlign: 'center' }}>
      <h1>Documentation Generator</h1>
      <p>Drag and drop your Python project files below to automatically generate comprehensive documentation.</p>

      {/* Mode Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '20px', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="uploadType" 
            value="files" 
            checked={uploadType === 'files'} 
            onChange={() => { setUploadType('files'); setFiles([]); }} 
          />
          {' '}Upload Multiple Files
        </label>
        <label style={{ cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="uploadType" 
            value="folder" 
            checked={uploadType === 'folder'} 
            onChange={() => { setUploadType('folder'); setFiles([]); }} 
          />
          {' '}Upload Project Folder
        </label>
      </div>

      {/* Dynamic Input Box */}
      <div 
        style={{ 
          border: '2px dashed #4A90E2', 
          padding: '30px', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          backgroundColor: '#F9FBFD',
          marginBottom: '20px',
          position: 'relative'
        }}
      >
        <input 
          type="file" 
          id="file-upload"
          multiple 
          {...(uploadType === 'folder' ? { webkitdirectory: "", directory: "" } : {})}
          accept=".py" 
          onChange={handleFileChange} 
          style={{ display: 'none' }}
        />
        <label 
          htmlFor="file-upload"
          style={{
            backgroundColor: '#4A90E2',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            display: 'inline-block',
            textAlign: 'center'
          }}
        >
          Choose Files
        </label>
        <p style={{ marginTop: '12px', marginBottom: '0', color: '#333', fontWeight: '500' }}>
          {files.length > 0 
            ? `${files.length} file(s) selected.` 
            : (uploadType === 'files' ? 'Choose individual Python (.py) files' : 'Choose a project directory/folder')}
        </p>
      </div>

      {/* Button Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          style={{
            backgroundColor: '#4A90E2',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Generating Documentation...' : 'Generate Documentation'}
        </button>

        <button
          onClick={handleDownload}
          disabled={!markdown}
          style={{
            backgroundColor: markdown ? '#2da44e' : '#cccccc',
            color: markdown ? 'white' : '#7a7a7a',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: markdown ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: markdown ? '0 4px 12px rgba(45, 164, 78, 0.2)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          📥 Download Documentation (.md)
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}

      {markdown && (
        <div className="markdown-container" style={{ 
          maxWidth: '850px', 
          margin: '40px auto 20px auto', 
          padding: '40px', 
          border: '1px solid #333', 
          borderRadius: '8px', 
          background: '#121212', /* Dark background matching the image */
          color: '#e0e0e0',      /* Light gray text */
          textAlign: 'left',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Targeted style block for dark mode headers */}
          <style>{`
            .markdown-container h1, 
            .markdown-container h2, 
            .markdown-container h3,
            .markdown-container h4,
            .markdown-container strong {
              color: #ffffff !important; 
            }
            .markdown-container p {
              color: #cccccc;
            }
          `}</style>

          {/* The Actual Documentation */}
          <div style={{ lineHeight: '1.6', fontSize: '15px' }}>
            <ReactMarkdown
              components={{
                h1: ({node, children}) => <h1 style={{ borderBottom: '1px solid #333', paddingBottom: '.3em', fontSize: '2em', marginTop: '0', marginBottom: '16px', fontWeight: '600' }}>{children}</h1>,
                h2: ({node, children}) => <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '.3em', fontSize: '1.5em', marginTop: '24px', marginBottom: '16px', fontWeight: '600' }}>{children}</h2>,
                h3: ({node, children}) => <h3 style={{ fontSize: '1.25em', marginTop: '24px', marginBottom: '16px', fontWeight: '600' }}>{children}</h3>,
                
                // Advanced Code Rendering
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  
                  // If it is a block of code (like your python example)
                  return !inline && match ? (
                    <div style={{ marginTop: '16px', marginBottom: '16px', borderRadius: '6px', overflow: 'hidden' }}>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, padding: '16px', background: '#1e1e1e' }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    // If it is inline code (like `class CodeAnalyzer`)
                    <code style={{ 
                      background: '#2b2b2b', 
                      padding: '0.2em 0.4em', 
                      borderRadius: '6px', 
                      fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace', 
                      fontSize: '85%',
                      color: '#d4d4d4',
                      border: '1px solid #444'
                    }}>
                      {children}
                    </code>
                  );
                },
                
                hr: () => <hr style={{ height: '1px', padding: '0', margin: '24px 0', backgroundColor: '#333', border: '0' }} />
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;