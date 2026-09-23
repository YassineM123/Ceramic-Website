# XAUUSD Telegram Copy Bot

Python bot that listens to your Telegram signal channels and copies XAUUSD trades to MetaTrader 5.

It starts in `DRY_RUN=true`, so it will parse and log trades without placing real orders.

## Setup

1. Install Python 3.11+.
2. Install MetaTrader 5 and login to your trading account on this PC.
3. Create Telegram API credentials from `https://my.telegram.org`:
   - `api_id`
   - `api_hash`
4. Copy `.env.example` to `.env` and fill the values.
5. Install dependencies:

```powershell
cd "C:\Users\anoth\Desktop\fadi webite\trading-bot"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

6. Run parser tests:

```powershell
python -m unittest discover tests
```

7. Start the bot:

```powershell
python run.py
```

The first run asks for your Telegram phone login code. The session is saved locally.

## Safety

- Keep `DRY_RUN=true` until the logs prove the parser reads your channels correctly.
- Do not paste Telegram API hash, broker login, or account passwords into chat.
- Start with a demo MT5 account.
- This bot uses a fixed lot size. It does not guarantee profit and does not protect from signal quality, slippage, spread, broker suffixes, or duplicated channel posts.

## Supported Signal Examples

```text
XAUUSD BUY 2340
SL 2332
TP1 2348
TP2 2355
```

```text
GOLD SELL NOW
SL: 2360
TP: 2345
```

```text
BUY LIMIT XAUUSD 2325-2327
SL 2318
TP1 2335
TP2 2342
```

Send me 2-3 real messages copied from your Telegram channels and I can tune the parser exactly to them.
