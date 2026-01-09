from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Configuration centrale du moteur de livraison.
    Toutes les valeurs sont configurables via variables d'environnement
    pour un usage multi-clients (SaaS).
    """

    BASE_COST_PER_KM: float = 75.0  # FCFA, règle métier clé

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

