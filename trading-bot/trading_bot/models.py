from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class Side(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class EntryKind(str, Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"
    STOP = "STOP"


@dataclass(frozen=True)
class TradeSignal:
    symbol: str
    side: Side
    entry_kind: EntryKind
    entry_min: float | None
    entry_max: float | None
    stop_loss: float | None
    take_profits: tuple[float, ...]
    raw_text: str

    @property
    def entry_price(self) -> float | None:
        if self.entry_min is None:
            return None
        if self.entry_max is None:
            return self.entry_min
        return round((self.entry_min + self.entry_max) / 2, 3)
