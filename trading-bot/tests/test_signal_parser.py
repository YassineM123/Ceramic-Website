import unittest

from trading_bot.models import EntryKind, Side
from trading_bot.signal_parser import parse_signal


class SignalParserTests(unittest.TestCase):
    def test_buy_with_entry_sl_tp(self):
        signal = parse_signal(
            """
            XAUUSD BUY 2340
            SL 2332
            TP1 2348
            TP2 2355
            """
        )

        self.assertIsNotNone(signal)
        self.assertEqual(signal.side, Side.BUY)
        self.assertEqual(signal.entry_kind, EntryKind.MARKET)
        self.assertEqual(signal.entry_price, 2340)
        self.assertEqual(signal.stop_loss, 2332)
        self.assertEqual(signal.take_profits, (2348, 2355))

    def test_sell_now_without_entry(self):
        signal = parse_signal(
            """
            GOLD SELL NOW
            SL: 2360
            TP: 2345
            """
        )

        self.assertIsNotNone(signal)
        self.assertEqual(signal.side, Side.SELL)
        self.assertEqual(signal.entry_kind, EntryKind.MARKET)
        self.assertIsNone(signal.entry_price)
        self.assertEqual(signal.stop_loss, 2360)
        self.assertEqual(signal.take_profits, (2345,))

    def test_buy_limit_range(self):
        signal = parse_signal(
            """
            BUY LIMIT XAUUSD 2325-2327
            SL 2318
            TP1 2335
            TP2 2342
            """
        )

        self.assertIsNotNone(signal)
        self.assertEqual(signal.side, Side.BUY)
        self.assertEqual(signal.entry_kind, EntryKind.LIMIT)
        self.assertEqual(signal.entry_min, 2325)
        self.assertEqual(signal.entry_max, 2327)
        self.assertEqual(signal.entry_price, 2326)

    def test_ignores_non_gold_message(self):
        self.assertIsNone(parse_signal("EURUSD BUY 1.0800 SL 1.0750 TP 1.0900"))


if __name__ == "__main__":
    unittest.main()
