#!/usr/bin/env python3
"""
Inbox Detox - Startup Script
Run this script to start the development server
"""

import os
import sys
import uvicorn
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

if __name__ == "__main__":
    # Set environment variables if not already set
    os.environ.setdefault("PYTHONPATH", str(project_root))
    
    # Run the application
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=[str(project_root / "app"), str(project_root / "templates"), str(project_root / "static")]
    )