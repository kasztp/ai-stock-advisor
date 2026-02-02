# AI Stock Advisor - Backend

This is the FastAPI backend for the AI Stock Advisor application.

## Quick Start

1. Install `uv` if you haven't: `curl -LsSf https://astral.sh/uv/install.sh | sh`
2. Create `.env` and add `GEMINI_API_KEY`.
3. Run the server:
   ```bash
   uv run main.py
   ```

The API will be available at `http://localhost:8000`.

## Architecture

- `main.py`: Entry point and FastAPI configuration.
- `app/routes.py`: API endpoint definitions.
- `app/services.py`: Business logic, including `yfinance` data fetching and Gemini API integration.
- `app/models.py`: Pydantic data models for request/response validation.
- `app/prompts.py`: System prompts for the Gemini model.

For more details, see the [root README](../README.md).
