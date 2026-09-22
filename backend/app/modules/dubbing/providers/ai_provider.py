import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Dict, List

logger = logging.getLogger("meridian.providers")

class BaseAIProvider(ABC):
    """Lớp cơ sở trừu tượng cho các nhà cung cấp AI dịch và xử lý giọng nói"""
    @abstractmethod
    async def translate_subtitles(self, text_content: str, source_lang: str, target_lang: str, style_prompt: str) -> str:
        pass

    @abstractmethod
    async def generate_speech(self, text: str, voice_model: str) -> Dict[str, str]:
        pass

class DeepSeekTranslationProvider(BaseAIProvider):
    """Tích hợp DeepSeek API cho biên dịch ngữ cảnh cao cấp"""
    async def translate_subtitles(self, text_content: str, source_lang: str, target_lang: str, style_prompt: str) -> str:
        logger.info(f"[DeepSeek] Bắt đầu dịch từ {source_lang} sang {target_lang} với prompt: {style_prompt}")
        await asyncio.sleep(0.5) # Giả lập I/O async
        return "Tôi nghĩ rằng có điều cần thiết phải nhắc nhở ngài một chút."

    async def generate_speech(self, text: str, voice_model: str) -> Dict[str, str]:
        return {"status": "success", "audio_format": "mp3", "voice_model": voice_model}

class OpenAITranslationProvider(BaseAIProvider):
    """Tích hợp OpenAI GPT-4o cho dịch thuật và tạo phụ đề"""
    async def translate_subtitles(self, text_content: str, source_lang: str, target_lang: str, style_prompt: str) -> str:
        logger.info(f"[OpenAI] Biên dịch phụ đề theo văn phong {style_prompt}")
        await asyncio.sleep(0.5)
        return "Tôi thiết nghĩ cần phải đưa ra lời nhắc nhở đối với ngài."

    async def generate_speech(self, text: str, voice_model: str) -> Dict[str, str]:
        return {"status": "success", "audio_format": "wav", "voice_model": voice_model}

class OfflineTTSProvider(BaseAIProvider):
    """Tích hợp mô hình giọng đọc cục bộ (Offline Voice Engine) tiết kiệm chi phí"""
    async def translate_subtitles(self, text_content: str, source_lang: str, target_lang: str, style_prompt: str) -> str:
        return text_content

    async def generate_speech(self, text: str, voice_model: str) -> Dict[str, str]:
        logger.info(f"[OfflineTTS] Tạo giọng đọc cục bộ với model: {voice_model}")
        await asyncio.sleep(0.4)
        return {"status": "success", "engine": "local_vits", "audio_path": "/storage/audio/output.wav"}

# Registry Quản lý các Providers
class ProviderRegistry:
    @staticmethod
    def get_available_providers() -> List[Dict[str, str]]:
        return [
            {
                "id": "deepseek",
                "name": "DeepSeek API",
                "mode": "Online (Cloud)",
                "description": "Biên dịch theo văn phong truyện tranh, kiếm hiệp, tiên hiệp cực kỳ tự nhiên.",
                "credit_rate": "10 credits / phút video",
                "is_available": True
            },
            {
                "id": "openai",
                "name": "OpenAI GPT-4o",
                "mode": "Online (Cloud)",
                "description": "Độ chính xác ngữ pháp cao nhất, thích hợp cho phim tài liệu và phóng sự.",
                "credit_rate": "15 credits / phút video",
                "is_available": True
            },
            {
                "id": "offline_local",
                "name": "Local VITS & Whisper",
                "mode": "Offline (Local)",
                "description": "Chạy hoàn toàn trên GPU nội bộ của máy chủ, không tốn credit Cloud.",
                "credit_rate": "0 credits (Miễn phí)",
                "is_available": True
            }
        ]

    @staticmethod
    def resolve_provider(provider_name: str) -> BaseAIProvider:
        if "deepseek" in provider_name.lower():
            return DeepSeekTranslationProvider()
        elif "openai" in provider_name.lower():
            return OpenAITranslationProvider()
        return OfflineTTSProvider()
