from __future__ import annotations

from .config import Settings
from .models import EntryKind, Side, TradeSignal


class MT5Executor:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def execute(self, signal: TradeSignal) -> None:
        if self.settings.lot_size <= 0:
            raise ValueError("LOT_SIZE must be greater than zero")
        if self.settings.lot_size > self.settings.max_lot_size:
            raise ValueError("LOT_SIZE is greater than MAX_LOT_SIZE")
        if signal.entry_kind == EntryKind.MARKET and not self.settings.allow_market_execution:
            print("[SKIP] Market execution is disabled.")
            return

        if self.settings.dry_run:
            print(f"[DRY_RUN] {self._summary(signal)}")
            return

        self._send_to_mt5(signal)

    def _send_to_mt5(self, signal: TradeSignal) -> None:
        import MetaTrader5 as mt5

        if not mt5.initialize():
            raise RuntimeError(f"MT5 initialize failed: {mt5.last_error()}")

        try:
            if not mt5.symbol_select(self.settings.mt5_symbol, True):
                raise RuntimeError(f"Could not select symbol {self.settings.mt5_symbol}: {mt5.last_error()}")

            symbol_info = mt5.symbol_info(self.settings.mt5_symbol)
            if symbol_info is None:
                raise RuntimeError(f"Symbol not found in MT5: {self.settings.mt5_symbol}")

            tick = mt5.symbol_info_tick(self.settings.mt5_symbol)
            if tick is None:
                raise RuntimeError(f"No tick data for {self.settings.mt5_symbol}")

            request = self._build_order_request(mt5, signal, tick)
            result = mt5.order_send(request)
            if result is None:
                raise RuntimeError(f"MT5 order_send returned None: {mt5.last_error()}")
            if result.retcode != mt5.TRADE_RETCODE_DONE and result.retcode != mt5.TRADE_RETCODE_PLACED:
                raise RuntimeError(f"MT5 order rejected: retcode={result.retcode}, comment={result.comment}")

            print(f"[ORDER_OK] ticket={result.order} {self._summary(signal)}")
        finally:
            mt5.shutdown()

    def _build_order_request(self, mt5, signal: TradeSignal, tick) -> dict:
        order_type = self._order_type(mt5, signal)
        price = self._order_price(signal, tick)
        action = mt5.TRADE_ACTION_DEAL if signal.entry_kind == EntryKind.MARKET else mt5.TRADE_ACTION_PENDING

        request = {
            "action": action,
            "symbol": self.settings.mt5_symbol,
            "volume": self.settings.lot_size,
            "type": order_type,
            "price": price,
            "deviation": self.settings.deviation_points,
            "magic": self.settings.magic_number,
            "comment": "telegram-xauusd-copy",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }
        if signal.stop_loss is not None:
            request["sl"] = signal.stop_loss
        if signal.take_profits:
            request["tp"] = signal.take_profits[0]
        return request

    def _order_type(self, mt5, signal: TradeSignal):
        if signal.entry_kind == EntryKind.LIMIT:
            return mt5.ORDER_TYPE_BUY_LIMIT if signal.side == Side.BUY else mt5.ORDER_TYPE_SELL_LIMIT
        if signal.entry_kind == EntryKind.STOP:
            return mt5.ORDER_TYPE_BUY_STOP if signal.side == Side.BUY else mt5.ORDER_TYPE_SELL_STOP
        return mt5.ORDER_TYPE_BUY if signal.side == Side.BUY else mt5.ORDER_TYPE_SELL

    def _order_price(self, signal: TradeSignal, tick) -> float:
        if signal.entry_kind == EntryKind.MARKET:
            return tick.ask if signal.side == Side.BUY else tick.bid
        entry_price = signal.entry_price
        if entry_price is None:
            raise ValueError("Pending order requires an entry price")
        return entry_price

    def _summary(self, signal: TradeSignal) -> str:
        tps = ", ".join(str(tp) for tp in signal.take_profits) or "none"
        return (
            f"{signal.side.value} {self.settings.mt5_symbol} "
            f"kind={signal.entry_kind.value} entry={signal.entry_price or 'market'} "
            f"sl={signal.stop_loss or 'none'} tp={tps} lot={self.settings.lot_size}"
        )
