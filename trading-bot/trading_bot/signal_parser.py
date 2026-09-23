from __future__ import annotations

import re

from .models import EntryKind, Side, TradeSignal


PRICE_RE = r"(\d{3,5}(?:[.,]\d+)?)"
RANGE_RE = rf"{PRICE_RE}\s*(?:-|TO|/)\s*{PRICE_RE}"


def _to_float(value: str) -> float:
    return float(value.replace(",", "."))


def _clean(text: str) -> str:
    text = text.upper()
    text = text.replace("🎯", " ")
    text = text.replace("✅", " ")
    text = text.replace(":", " ")
    text = re.sub(r"[^\w\s@.,+\-/]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def parse_signal(text: str, default_symbol: str = "XAUUSD") -> TradeSignal | None:
    cleaned = _clean(text)
    if not cleaned:
        return None

    if not re.search(r"\b(XAUUSD|GOLD|XAU|OR)\b", cleaned):
        return None

    side_match = re.search(r"\b(BUY|SELL|LONG|SHORT)\b", cleaned)
    if not side_match:
        return None

    side_word = side_match.group(1)
    side = Side.BUY if side_word in {"BUY", "LONG"} else Side.SELL

    symbol = default_symbol.upper()
    if re.search(r"\bGOLD\b", cleaned):
        symbol = default_symbol.upper()
    elif re.search(r"\bXAUUSD\b", cleaned):
        symbol = default_symbol.upper()

    entry_kind = EntryKind.MARKET
    if re.search(r"\b(BUY|SELL)\s+LIMIT\b|\bLIMIT\b", cleaned):
        entry_kind = EntryKind.LIMIT
    elif re.search(r"\b(BUY|SELL)\s+STOP\b|\bSTOP\b", cleaned):
        entry_kind = EntryKind.STOP

    stop_loss = _first_price_after(cleaned, ("SL", "S/L", "STOPLOSS", "STOP LOSS"))
    take_profits = tuple(_find_take_profits(cleaned))
    entry_min, entry_max = _find_entry(cleaned, side_match.start(), stop_loss, take_profits)

    if entry_kind != EntryKind.MARKET and entry_min is None:
        return None

    return TradeSignal(
        symbol=symbol,
        side=side,
        entry_kind=entry_kind,
        entry_min=entry_min,
        entry_max=entry_max,
        stop_loss=stop_loss,
        take_profits=take_profits,
        raw_text=text,
    )


def _first_price_after(text: str, labels: tuple[str, ...]) -> float | None:
    joined = "|".join(re.escape(label) for label in labels)
    match = re.search(rf"\b(?:{joined})\b\s*{PRICE_RE}", text)
    if not match:
        return None
    return _to_float(match.group(1))


def _find_take_profits(text: str) -> list[float]:
    values: list[float] = []
    patterns = [
        rf"\bTP\s*\d*\b\s*{PRICE_RE}",
        rf"\bTAKE\s*PROFIT\s*\d*\b\s*{PRICE_RE}",
    ]
    for pattern in patterns:
        for match in re.finditer(pattern, text):
            value = _to_float(match.group(1))
            if value not in values:
                values.append(value)
    return values


def _find_entry(
    text: str,
    side_index: int,
    stop_loss: float | None,
    take_profits: tuple[float, ...],
) -> tuple[float | None, float | None]:
    entry_patterns = (
        rf"\b(?:ENTRY|ENTREE|OPEN|ZONE|PRICE|AT|@)\b\s*{RANGE_RE}",
        rf"\b(?:ENTRY|ENTREE|OPEN|ZONE|PRICE|AT|@)\b\s*{PRICE_RE}",
        rf"\b(?:BUY|SELL|LONG|SHORT)(?:\s+(?:LIMIT|STOP|NOW|MARKET))?\s+(?:XAUUSD|GOLD|XAU)?\s*{RANGE_RE}",
        rf"\b(?:BUY|SELL|LONG|SHORT)(?:\s+(?:LIMIT|STOP|NOW|MARKET))?\s+(?:XAUUSD|GOLD|XAU)?\s*{PRICE_RE}",
    )

    for pattern in entry_patterns:
        match = re.search(pattern, text)
        if not match:
            continue
        prices = [_to_float(group) for group in match.groups() if group is not None]
        if len(prices) >= 2:
            return min(prices[0], prices[1]), max(prices[0], prices[1])
        if len(prices) == 1:
            return prices[0], None

    excluded = {value for value in take_profits}
    if stop_loss is not None:
        excluded.add(stop_loss)

    tail = text[side_index:]
    for match in re.finditer(PRICE_RE, tail):
        value = _to_float(match.group(1))
        if value not in excluded:
            return value, None

    return None, None
