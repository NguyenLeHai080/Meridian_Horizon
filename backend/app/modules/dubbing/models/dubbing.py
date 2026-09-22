from sqlalchemy import Column, ForeignKey, Integer, String, Text
from app.core.database import Base

class DubbingProject(Base):
    __tablename__ = "dubbing_projects"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    video_filename = Column(String(255), default="video_sample_01.mp4", nullable=False)
    source_lang = Column(String(50), default="Tiếng Trung", nullable=False)
    target_lang = Column(String(50), default="Tiếng Việt", nullable=False)
    provider_type = Column(String(50), default="DeepSeek API", nullable=False)
    genre = Column(String(100), default="Xuyên không / Trọng sinh", nullable=False)
    custom_prompt = Column(Text, nullable=True)
    current_step = Column(Integer, default=1, nullable=False) # 1: Tách transcript, 2: Dịch, 3: Phụ đề, 4: Giọng, 5: Xuất bản
    status = Column(String(50), default="ready", nullable=False) # ready, processing, completed, error
    progress = Column(Integer, default=20, nullable=False) # 0 -> 100%
    credits_used = Column(Integer, default=150, nullable=False)
    subtitles_preview = Column(Text, default="[00:00:01.000 --> 00:00:03.500]\n我想有必要给您提醒下\nTôi nghĩ cần phải nhắc nhở ngài một chút", nullable=True)
