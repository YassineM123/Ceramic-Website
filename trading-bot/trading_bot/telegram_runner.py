from __future__ import annotations

import asyncio

from telethon import TelegramClient, events

from .config import load_settings
from .mt5_executor import MT5Executor
from .signal_parser import parse_signal
from .storage import SignalStore


def _channel_arg(value: str) -> str | int:
    if value.startswith("-") and value[1:].isdigit():
        return int(value)
    if value.isdigit():
        return int(value)
    return value


async def run() -> None:
    settings = load_settings()
    channels = [_channel_arg(channel) for channel in settings.telegram_channels]
    executor = MT5Executor(settings)
    store = SignalStore()

    print(f"[START] channels={settings.telegram_channels} symbol={settings.mt5_symbol} dry_run={settings.dry_run}")

    client = TelegramClient(
        settings.telegram_session,
        settings.telegram_api_id,
        settings.telegram_api_hash,
    )

    @client.on(events.NewMessage(chats=channels))
    async def on_message(event) -> None:
        message_key = f"{event.chat_id}:{event.id}"
        if store.has_processed(message_key):
            return

        text = event.raw_text or ""
        signal = parse_signal(text, default_symbol=settings.mt5_symbol)
        if signal is None:
            return

        print(f"[SIGNAL] chat={event.chat_id} message={event.id}")
        try:
            executor.execute(signal)
            store.mark_processed(message_key)
        except Exception as exc:
            print(f"[ERROR] failed to execute message={message_key}: {exc}")

    async with client:
        print("[READY] Listening for Telegram messages...")
        await client.run_until_disconnected()


def main() -> None:
    asyncio.run(run())
