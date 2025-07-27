import os
from huggingface_hub import snapshot_download

REPO_ID = "mlc-ai/Qwen1.5-1.8B-Chat-q4f32_1-MLC"
MODEL_DIR_NAME = "Qwen3-1.7B-q4f32_1-MLC"
TARGET_DIR = os.path.abspath(os.path.join("..", "packages", "example", "public", "models", MODEL_DIR_NAME))

print(f"Downloading model {REPO_ID} to {TARGET_DIR}...")
snapshot_download(
    repo_id=REPO_ID,
    local_dir=TARGET_DIR,
    local_dir_use_symlinks=False,
    resume_download=True,
)

print(f"Model downloaded to {TARGET_DIR}")
