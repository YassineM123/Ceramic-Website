from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


def _bool_env(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "y", "on"}


def _csv_env(name: str) -> list[str]:
    value = os.getenv(name, "")
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    telegram_api_id: int
    telegram_api_hash: str
    telegram_session: str
    telegram_channels: list[str]
    mt5_symbol: str
    dry_run: bool
    lot_size: float
    max_lot_size: float
    deviation_points: int
    magic_number: int
    allow_market_execution: bool


def load_settings() -> Settings:
    load_dotenv()

    api_id_raw = os.getenv("TELEGRAM_API_ID", "").strip()
    api_hash = os.getenv("TELEGRAM_API_HASH", "").strip()
    channels = _csv_env("TELEGRAM_CHANNELS")

    missing = []
    if not api_id_raw:
        missing.append("TELEGRAM_API_ID")
    if not api_hash:
        missing.append("TELEGRAM_API_HASH")
    if not channels:
        missing.append("TELEGRAM_CHANNELS")
    if missing:
        raise RuntimeError(f"Missing required .env values: {', '.join(missing)}")

    return Settings(
        telegram_api_id=int(api_id_raw),
        telegram_api_hash=api_hash,
        telegram_session=os.getenv("TELEGRAM_SESSION", "xauusd_copy_bot").strip(),
        telegram_channels=channels,
        mt5_symbol=os.getenv("MT5_SYMBOL", "XAUUSD").strip(),
        dry_run=_bool_env("DRY_RUN", True),
        lot_size=float(os.getenv("LOT_SIZE", "0.01")),
        max_lot_size=float(os.getenv("MAX_LOT_SIZE", "0.05")),
        deviation_points=int(os.getenv("DEVIATION_POINTS", "30")),
        magic_number=int(os.getenv("MAGIC_NUMBER", "260604")),
        allow_market_execution=_bool_env("ALLOW_MARKET_EXECUTION", True),
    )
