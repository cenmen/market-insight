from pydantic import BaseModel, Field
import os


class Settings(BaseModel):
    app_name: str = Field(default="wealth-channel")
    timezone: str = Field(default="Asia/Shanghai")
    env: str = Field(default=os.getenv("env", "development"))
    log_dir: str = Field(default=os.getenv("LOG_DIR", "logs"))
    version: str = Field(default=os.getenv("APP_VERSION", "1.0.0"))

    @property
    def is_dev(self) -> bool:
        return self.env.lower() == "development"

    @property
    def is_prod(self) -> bool:
        return self.env.lower() == "production"


settings = Settings()
