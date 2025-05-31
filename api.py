from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define models
class GenerationRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 2048
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.95
    stream: Optional[bool] = False

class GenerationResponse(BaseModel):
    text: str
    usage: Dict[str, int]

class HealthResponse(BaseModel):
    status: str
    version: str = "1.0.0"

# Model initialization with lazy loading
model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load model only if environment is configured for it
    if os.environ.get("LOAD_LLM_MODEL", "false").lower() == "true":
        try:
            from vllm import LLM
            logger.info("Initializing LLM model...")
            # Use a smaller model by default or get from environment
            model_name = os.environ.get("LLM_MODEL_NAME", "meta-llama/Llama-3-8B-Instruct")
            global model
            model = LLM(model=model_name)
            logger.info(f"Model {model_name} loaded successfully")
        except ImportError:
            logger.warning("vLLM package not installed. LLM functionality will be disabled.")
        except Exception as e:
            logger.error(f"Failed to load LLM model: {str(e)}")
    else:
        logger.info("LLM model loading skipped based on environment configuration")
    
    yield
    
    # Shutdown: Clean up resources
    logger.info("Shutting down API")

# Initialize FastAPI app
app = FastAPI(
    title="OpenCode LLM API",
    description="API for interacting with language models using vLLM",
    version="1.0.0",
    lifespan=lifespan
)

def get_model():
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="LLM model is not loaded. Set LOAD_LLM_MODEL=true to enable this feature."
        )
    return model

@app.post("/generate", response_model=GenerationResponse)
async def generate_text(request: GenerationRequest, llm_model = Depends(get_model)):
    try:
        from vllm import SamplingParams
        
        # Configure sampling parameters
        sampling_params = SamplingParams(
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            top_p=request.top_p
        )
        
        # Generate text
        outputs = llm_model.generate(request.prompt, sampling_params)
        
        # Get the first result
        output = outputs[0]
        
        return GenerationResponse(
            text=output.outputs[0].text,
            usage={
                "prompt_tokens": output.prompt_tokens,
                "completion_tokens": output.completion_tokens,
                "total_tokens": output.prompt_tokens + output.completion_tokens
            }
        )
    except Exception as e:
        logger.error(f"Error generating text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("API_PORT", 8000))
    host = os.environ.get("API_HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)